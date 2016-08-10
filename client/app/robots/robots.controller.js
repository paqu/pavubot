angular.module('inzApp')
    .controller('RobotsCtrl', ['$scope','$http','Socket', function ($scope, $http, Socket) {
       $scope.robots = [];

       $http.get('/api/robots').then(function (response) {
          $scope.robots = response.data;
       });

        Socket.on('connect', function () {
            console.log("[on] connect to server");
        });

        Socket.on('user:add_robot', function (data) {
            console.log("[on] user:add_robot");
            $scope.robots.push(data.robot);
        });

        Socket.on('user:update_video_socketId', function (data) {
            console.log("[on] user:update_video_socketId" + data.video_socketId);

            for (var index = 0; index < $scope.robots.length; index++)
               if ($scope.robots[index]._id ==  data.id)
                   break;

            $scope.robots[index].video_socketId = data.video_socketId;
        });

        Socket.on('user:remove_robot', function (data) {
            console.log("[on] user:remove_robot");

            for (var index = 0; index < $scope.robots.length; index++)
                if (data.id == $scope.robots[index]._id)
                    break;
            $scope.robots.splice(index,1);
        });


        Socket.on('disconnect', function() {
            $scope.robots = [];
        });
}])

    .controller('RobotCtrl',['$scope','$state', '$http','$document','$timeout', 'Socket', '$stateParams', function ($scope, $state, $http, $document,$timeout, Socket, $stateParams) {


        var UPDATE_SPEED = "server_user_nsp:update_speed";
        var SERVO_CHANGE = "server_user_nsp:robot_change_servo_angle";
        var ROBOT_MOVE   = "server_user_nsp:robot_move";
        var STOP_VIDEO   = "server_user_nsp:stop_video";
        var START_VIDEO  = "server_user_nsp:start_video";

        var BASE_SPEED_ERR_MSG  = "Wprowadz wartość z przedziału [0-100] w polu";
        var LEFT_SPEED_ERR_MSG  = BASE_SPEED_ERR_MSG + " 'Lewy'." ;
        var RIGHT_SPEED_ERR_MSG = BASE_SPEED_ERR_MSG + " 'Prawy'.";
        var LEFT_RIGHT_SPEED_ERR_MSG = LEFT_SPEED_ERR_MSG + " " + RIGHT_SPEED_ERR_MSG;

        var key_down = false;
        var change_direction = false;
        var isStart = false;

        $scope.robot = {};
        $scope.change_direction_by = 90;
        $scope.distance_sensor = 'sonar';
        $scope.isSpeedError;
        $scope.speed_error_msg;

        $scope.go_straight = function () {
            if (!key_down) {
                key_down = true;
                console.log("robot go_straight");
                Socket.emit("server_user_nsp:go_straight",{robotId:getRobotId()});
            }
        }

        $scope.go_back = function () {
            if (!key_down) {
                key_down = true;
                console.log("robot go_back");
                Socket.emit("server_user_nsp:go_back",{robotId:getRobotId()});
            }
        }
        

        $scope.turn_left = function () {
            if (!key_down) {
                key_down = true;
                console.log("robot go_left");
                Socket.emit("server_user_nsp:turn_left",{robotId:getRobotId()});
            }
        }

        $scope.turn_right = function () {
            if (!key_down) {
                key_down = true;
                console.log("robot go_right");
                Socket.emit("server_user_nsp:turn_right",{robotId:getRobotId()});
            }
        }
        function robotStop() {
            key_down = false;
            console.log('robot stop');
            Socket.emit("server_user_nsp:stop",{robotId:getRobotId()});
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

        $scope.update_speed       = updateSpeed; 
        $scope.stop_video         = stopVideo;
        $scope.start_video        = startVideo;
        $scope.stop               = robotStop;
        $scope.servo_max_left     = setServoMin;
        $scope.servo_max_right    = setServoMax;
        $scope.servo_center       = setServoCenter;
        $scope.left_servo_down    = decreaseServoAngle;
        $scope.right_servo_down   = increaseServoAngle;
        $scope.change_servo_angle = emitToServerServoChange;

        function updateSpeed() {
            if ((!getMotorASpeed()) && (!getMotorBSpeed())) {
                setSpeedError(LEFT_RIGHT_SPEED_ERR_MSG);
                return;
            }

            if (!getMotorASpeed()) {
                setSpeedError(LEFT_SPEED_ERR_MSG);
                return;
            }

            if (!getMotorBSpeed()) {
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



        
        function setServoMin() {
            console.log("set servo to min");
            setServo(-90);
            updateView();
            emitToServerServoChange();
        }
        
        function setServoMax() {
            console.log("set servo to max");
            setServo(90);
            updateView();
            emitToServerServoChange();

        }
        
        function setServoCenter() {
            console.log("set servo to center");
            setServo(0);
            updateView();
            emitToServerServoChange();
        }

        function decreaseServoAngle() {
            if (getServo() > -90) {
                setServo(getServo() - 1);
                updateView();
            }
        }
        function increaseServoAngle() {
            if (getServo() < 90) {
                setServo(getServo() + 1);
                updateView();
            }
        }

        function emitToServerServoChange() {
            console.log("[emit] "+ SERVO_CHANGE + "," + getServo());
            Socket.emit(SERVO_CHANGE, {
                servo_angle : getServo(),
                robotId     : getRobotId()
            });
        }

        function emitToServerRobotMove() {
            console.log("[emit] " + ROBOT_MOVE);
            Socket.emit(ROBOT_MOVE, {
                motor_a_mode : getMotorAMode(),
                motor_b_mode : getMotorBMode(),
                robotId      : getRobotId() 
            });
        }

        function emitToServerUpdateSpeed() {
                console.log("[emit] " + UPDATE_SPEED + "," + getRobotId());
                Socket.emit(UPDATE_SPEED, {
                    motor_a_speed : getMotorASpeed(),
                    motor_b_speed : getMotorBSpeed(),
                    robotId       : getRobotId()
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
            return $scope.robot.control_socketId;
        }

        function getRobotVideoId () {
            return $scope.robot.video_socketId;
        }

        function getMotorASpeed() {
            return $scope.robot.motor.motor_a_speed;
        }

        function getMotorBSpeed() {
            return $scope.robot.motor.motor_b_speed;
        }

        function setMotorAMode(value) {
                $scope.robot.motor.motor_a_mode = value;
        }

        function setMotorBMode(value) {
                $scope.robot.motor.motor_b_mode = value;
        }

        function getMotorAMode() {
            return $scope.robot.motor.motor_a_mode;
        }

        function getMotorBMode() {
            return $scope.robot.motor.motor_b_mode;
        }

        function setServo(val) {
            $scope.robot.servo.angle = val;
        }

        function getServo() {
            return Number($scope.robot.servo.angle);
        }


        $http.get('/api/robots/' + $stateParams.id +"/control").then(function (response) {
            $scope.robot = response.data;
            console.log("[emit] server_user_nsp:join_to_robot_chanel:" + $scope.robot.control_socketId);
            Socket.emit("server_user_nsp:join_to_robot_chanel",{chanel:$scope.robot.control_socketId}); //$scope.robot.control_socketId});
//            Socket.connect();
        });

        Socket.on("connect", function () {
            console.log("conneted to server from user interface");
        });

        Socket.on("user_robot:update_video_socketId", function (data) {
            console.log("[on] user_robot:update_video_socketId to " + data.video_socketId);
            $scope.robot.video_socketId = data.video_socketId;
        });

        Socket.on("user_robot:update_encoder_distance_a",function (data){
            console.log('[on] user_robot:update_encoder_distance_a' + JSON.stringify(data));
            $scope.robot.encoder.distance_a = data.encoder_distance_a;
        });

        Socket.on("user_robot:update_encoder_distance_b",function (data){
            console.log('[on] user_robot:update_encoder_distance_b' + JSON.stringify(data));
            $scope.robot.encoder.distance_b = data.encoder_distance_b;
        });

        Socket.on("user_robot:update_distance_sensor_sonar",function (data){
            console.log('[on] user_robot:update_distance_sensor_sonar' + JSON.stringify(data));
            $scope.robot.distance_sensor.sonar = data.distance_sensor_sonar;
        });

        Socket.on("user_robot:update_distance_sensor_infrared",function (data){
            console.log('[on] user_robot:update_distance_sensor_infrared' + JSON.stringify(data));
            $scope.robot.distance_sensor.infrared = data.distance_sensor_infrared;
        });

        Socket.on("user_robot:remove_robot", function () {
            console.log("[on] user_rebot:remove_robot");
            alert('robot ' + $scope.robot.name + ' rozłączył się.');
            $state.go('robots');
        });
        
        Socket.on("user_robot:frame", function (data) {
            console.log("[on]:user_robot:frame");
            var uint8Arr = new Uint8Array(data.frame);
            var str = String.fromCharCode.apply(null, uint8Arr);
            var base64String = btoa(str);
            $scope.video_frame = 'data:image/png;base64,' + base64String;

        });

        $scope.$on('$destroy', function () {
            console.log("[on] $destroy");
            Socket.emit('server_user_nsp:leave_chanel',{chanel: getRobotId()});
        });
    }])
;

