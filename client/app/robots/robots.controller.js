angular.module("inzApp")
    .controller("RobotsCtrl", ["$scope","$http","Socket", function ($scope, $http, Socket) {
       $scope.robots = [];
       
       $scope.getRobotName      = getRobotName;
       $scope.getRobotAddressIP = getRobotAddressIP;
       $scope.getRobotMode      = getRobotMode;
       $scope.isVideoConnected  = isVideoConnected;

       $http.get("/api/robots").then(function (response) {
          $scope.robots = response.data;
       });

        Socket.on("connect", function () {
            console.log("[on] connect to server");
        });

        Socket.on("user:robots_list:add_robot", function (data) {
            console.log("[on] user:robots_list:add_robot");
            $scope.robots.push(data.robot);
        });

        Socket.on("user:robots_list:update_video_socket_id", function (data) {
            console.log("[on] user:robots_list:update_video_socket_id:" + data.video_socket_id);

            for (var index = 0; index < $scope.robots.length; index++)
               if ($scope.robots[index]._id ==  data.id)
                   break;

            $scope.robots[index].video_socket_id = data.video_socket_id;
        });

        Socket.on("user:robots_list:remove_robot", function (data) {
            console.log("[on] user:robots_list:remove_robot");

            for (var index = 0; index < $scope.robots.length; index++)
                if (data.id == $scope.robots[index]._id)
                    break;

            $scope.robots.splice(index,1);
        });

        Socket.on("disconnect", function() {
            $scope.robots = [];
        });


        function getRobotName(index) {
            return $scope.robots[index].robot_name;
        }

        function getRobotAddressIP(index) {
            return $scope.robots[index].address_ip;
        }

        function getRobotMode(index) {
            if ($scope.robots[index].robot_mode)
                return "manualny";
            else 
                return "autonomiczny";
        }

        function isVideoConnected(index) {
            if ($scope.robots[index].video_socket_id !== "no connection")
                return 1;
            else 
                return 0;
        }
            

}])

    .controller('RobotCtrl',['$scope','$state', '$http','$document','$timeout', 'Socket', '$stateParams', function ($scope, $state, $http, $document,$timeout, Socket, $stateParams) {


        var UPDATE_SPEED = "server:user:update_speed_both";
        var SERVO_CHANGE = "server:user:change_camera_angle_to";
        var ROBOT_MOVE   = "server:user:robot_move";
        var STOP_VIDEO   = "server:user:stop_video";
        var START_VIDEO  = "server:user:start_video";

        var BASE_SPEED_ERR_MSG  = "Wprowadz wartość z przedziału [0-100] w polu";
        var LEFT_SPEED_ERR_MSG  = BASE_SPEED_ERR_MSG + " 'Lewy'." ;
        var RIGHT_SPEED_ERR_MSG = BASE_SPEED_ERR_MSG + " 'Prawy'.";
        var LEFT_RIGHT_SPEED_ERR_MSG = LEFT_SPEED_ERR_MSG + " " + RIGHT_SPEED_ERR_MSG;

        var key_down = false;
        var change_direction = false;
        var isStart = false;

        $scope.robot = {};
        $scope.change_direction_by = 90;
        $scope.distance_sensor = "infrared";
        $scope.isSpeedError;
        $scope.speed_error_msg;

        $scope.isSonar   = isSonar;
        $scope.isInfrared = isInfrared;
        $scope.getDistanceSensorSonar    = getDistanceSensorSonar;
        $scope.getDistanceSensorInfrared = getDistanceSensorInfrared;

        $scope.updateSpeed        = updateSpeed; 

        $scope.isVideoConnected   = isVideoConnected;
        $scope.stop_video         = stopVideo;
        $scope.start_video        = startVideo;
        $scope.stop               = robotStop;
        
        $scope.getCameraAngle     = getCameraAngle;
        $scope.cameraAngleMin     = setCameraAngleMin;
        $scope.cameraAngleMax     = setCameraAngleMax;
        $scope.cameraAngleCenter  = setCameraAngleCenter;
        $scope.decCameraAngle     = decreaseCameraAngle;
        $scope.incCameraAngle     = increaseCameraAngle;
        $scope.updateCameraAngle  = emitToServerCameraAngleChange;

        function isSonar() {
            if ($scope.distance_sensor == "sonar")
                return true;
            else
                return false;
        }

        function isInfrared() {
            if ($scope.distance_sensor == "infrared")
                return true;
            else
                return false;
        }

        function getDistanceSensorSonar() {
            return $scope.robot.distance_sensor_sonar;
        }

        function getDistanceSensorInfrared() {
            return $scope.robot.distance_sensor_infrared;
        }

        $scope.go_straight = function () {

            if (!key_down) {
                key_down = true;
                console.log("robot go_straight");
                Socket.emit("server:user:go_straight",{robot_id:getRobotId()});
            }
        }

        $scope.go_back = function () {
            if (!key_down) {
                key_down = true;
                console.log("robot go_back");
                Socket.emit("server:user:go_back",{robot_id:getRobotId()});
            }
        }
        
        function isVideoConnected() {
            if ($scope.robot.video_socket_id !== "no connection")
                return 1;
            else 
                return 0;
        }

        $scope.turn_left = function () {
            if (!key_down) {
                key_down = true;
                console.log("robot go_left");
                Socket.emit("server:user:turn_left",{robot_id:getRobotId()});
            }
        }

        $scope.turn_right = function () {
            if (!key_down) {
                key_down = true;
                console.log("robot go_right");
                Socket.emit("server:user:turn_right",{robot_id:getRobotId()});
            }
        }
        function robotStop() {
            key_down = false;
            console.log('robot stop');
            Socket.emit("server:user:stop",{robot_id:getRobotId()});
        }

        $scope.decrease_dir_angle = function () {
            if ($scope.change_direction_by > 0) {
                console.log("decrease direction angle");
                $scope.change_direction_by -= 1;
                updateView();
            }
        }

        $scope.increase_dir_angle = function () {
            if ($scope.change_direction_by < 180) {
                console.log("increase direction angle");
                $scope.change_direction_by += 1;
                updateView();
            }
        }


        function updateSpeed() {
            if ((!getRightMotorSpeed()) && (!getLeftMotorSpeed())) {
                setSpeedError(LEFT_RIGHT_SPEED_ERR_MSG);
                return;
            }

            if (!getLeftMotorSpeed()) {
                setSpeedError(LEFT_SPEED_ERR_MSG);
                return;
            }

            if (!getRightMotorSpeed()) {
                setSpeedError(RIGHT_SPEED_ERR_MSG);
                return;
            }

            clearSpeedError();
            emitToServerUpdateSpeed();
        }

        function stopVideo() {
            if (isStart) {
                isStart = false;
                emitToServerStopVideo();
                $scope.video_frame = "";
            }
        }
        
        function startVideo() {
            if (!isStart) {
                isStart = true;
                emitToServerStartVideo();
            }
        }
        
        function setCameraAngleMin() {
            console.log("set servo to min");
            setCameraAngle(-90);
            updateView();
            emitToServerCameraAngleChange();
        }
        
        function setCameraAngleMax() {
            console.log("set servo to max");
            setCameraAngle(90);
            updateView();
            emitToServerCameraAngleChange();

        }
        
        function setCameraAngleCenter() {
            console.log("set servo to center");
            setCameraAngle(0);
            updateView();
            emitToServerCameraAngleChange();
        }
        
        function getRightMotorSpeed() {
            return $scope.robot.right_motor_speed;
        }
        function getLeftMotorSpeed() {
            return $scope.robot.left_motor_speed;
        }

        function decreaseCameraAngle() {
            if (getCameraAngle() > -90) {
                setCameraAngle(getCameraAngle() - 1);
                updateView();
            }
        }
        function increaseCameraAngle() {
            if (getCameraAngle() < 90) {
                setCameraAngle(getCameraAngle() + 1);
                updateView();
            }
        }

        function emitToServerCameraAngleChange() {
            console.log("[emit] "+ SERVO_CHANGE + "," + getCameraAngle());
            Socket.emit(SERVO_CHANGE, {
                camera_angle : getCameraAngle(),
                robot_id     : getRobotId()
            });
        }


        function emitToServerUpdateSpeed() {
                console.log("[emit] " + UPDATE_SPEED + "," + getRobotId());
                Socket.emit(UPDATE_SPEED, {
                    right_motor_speed : getRightMotorSpeed(),
                    left_motor_speed  : getLeftMotorSpeed(),
                    robot_id          : getRobotId()
                });
        }

        function emitToServerStopVideo() {
                console.log("[emit]:"+ STOP_VIDEO + "," + getRobotVideoId());
                Socket.emit(STOP_VIDEO,{
                    video_chanel:getRobotVideoId()
                });

        }

        function emitToServerStartVideo() {
                console.log("[emit]:"+ START_VIDEO + "," + getRobotVideoId());
                Socket.emit(START_VIDEO,{
                    video_chanel:getRobotVideoId()
                });
        }

        function updateView() {
            $scope.$apply();
        }

        function setSpeedError(msg) {
            $scope.speed_error_msg = msg;
            $scope.isSpeedError = true;
        }

        function getSpeedError() {
            return $scope.speed_error_msg;
        }

        function clearSpeedError() {
            $scope.speed_error_msg = "";
            $scope.isSpeedError = false;
        }

        function getRobotId() {
            return $scope.robot.control_socket_id;
        }

        function getRobotVideoId () {
            return $scope.robot.video_socket_id;
        }

        function setCameraAngle(val) {
            $scope.robot.camera_angle = val;
        }

        function getCameraAngle() {
            return $scope.robot.camera_angle;
        }

        $http.get('/api/robots/' + $stateParams.id +"/control").then(function (response) {
            $scope.robot = response.data;
            console.log("[emit] server:user:join_to_robot_chanel:" + getRobotId());
            Socket.emit("server:user:join_to_robot_chanel",{chanel:getRobotId()});
        });

        Socket.on("connect", function () {
            console.log("conneted to server from user interface");
        });

        Socket.on("user:robot:update_video_socket_id", function (data) {
            console.log("[on] user:robot:update_video_socket_id:" + data.video_socket_id);
            $scope.robot.video_socket_id = data.video_socket_id;
        });

        Socket.on("user:robot:update_right_encoder_distance",function (data){
            console.log('[on] user:robot:update_right_encoder_distance' + JSON.stringify(data));
            $scope.robot.right_encoder_distance = data.right_encoder_distance;
        });

        Socket.on("user:robot:update_left_encoder_distance",function (data){
            console.log('[on] user:robot:update_left_encoder_distance' + JSON.stringify(data));
            $scope.robot.left_encoder_distance = data.left_encoder_distance;
        });

        Socket.on("user:robot:update_distance_sensor_sonar",function (data){
            console.log('[on] user:robot:update_distance_sensor_sonar' + JSON.stringify(data));
            $scope.robot.distance_sensor_sonar = data.distance_sensor_sonar;
        });

        Socket.on("user:robot:update_distance_sensor_infrared",function (data){
            console.log('[on] user:robot:update_distance_sensor_infrared' + JSON.stringify(data));
            $scope.robot.distance_sensor_infrared = data.distance_sensor_infrared;
        });

        Socket.on("user:robot:remove_robot", function () {
            console.log("[on] user:robot:remove_robot");
            alert('robot ' + $scope.robot.robot_name + ' rozłączył się.');
            $state.go('robots');
        });
        
        Socket.on("user:robot:frame", function (data) {
            console.log("[on]:user:robot:frame");
            var uint8Arr = new Uint8Array(data.frame);
            var str = String.fromCharCode.apply(null, uint8Arr);
            var base64String = btoa(str);
            $scope.video_frame = 'data:image/png;base64,' + base64String;

        });

        $scope.$on('$destroy', function () {
            console.log("[on] $destroy");
            Socket.emit('server:user:leave_chanel',{chanel: getRobotId()});
        });
    }])
;

