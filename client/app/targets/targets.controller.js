angular.module('inzApp')
    .controller('RobotsCtrl', ['$scope','$http','Socket', function ($scope, $http, Socket) {
       $scope.robots = [];

       $http.get('/api/robots').then(function (response) {
          $scope.robots = response.data;
       });

        Socket.connect();

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

        $scope.$on('$destroy', function () {
            Socket.disconnect(true);
            Socket.removeAllListeners();
        });
}])

    .controller('RobotCtrl',['$scope','$state', '$http','$document', 'Socket', '$stateParams', function ($scope, $state, $http, $document, Socket, $stateParams) {
        var key_down = false;
        var change_direction = false;

        $scope.robot = {};
        $scope.change_direction_by = 90;

        $scope.state = 'stop';
        $scope.distance_sensor = 'sonar';
        $scope.video = 'hidden';


        $scope.stop_video = function () {
            if ($scope.state === 'start') {
                console.log(new Date() + ":stop video transmision");
                $scope.state = 'stop';
                console.log("[emit]:server_user_nsp:stop_video:" + $scope.robot.video_socketId);
                Socket.emit("server_user_nsp:stop_video",{video_chanel:$scope.robot.video_socketId});
                $scope.video_frame = "";
            }

        }

        $scope.start_video  = function () {
            if ($scope.state === 'stop') {
                console.log(new Date() + "start video transmision");
                $scope.state = 'start';
                console.log("[emit]:server_user_nsp:start_video:" + $scope.robot.video_socketId);
                Socket.emit("server_user_nsp:start_video",{video_chanel:$scope.robot.video_socketId});
            }
        }

        $scope.update_speed = function () {
            if (($scope.robot.motor.motor_a_speed === undefined) && ($scope.robot.motor.motor_b_speed === undefined)) {
                $scope.error_msg = 'Wprowadz wartość z przedziału [0-100] w polu "Lewy" \nWprowadz wartość z przedziału [0-100] w polu "Prawy"';
                $scope.error = true;
            } else  if ($scope.robot.motor.motor_a_speed === undefined) {
                $scope.error_msg = 'Wprowadz wartość z przedziału [0-100] w polu "Lewy"';
                $scope.error = true;
            }else if ($scope.robot.motor.motor_b_speed === undefined) {
                $scope.error_msg = 'Wprowadz wartość z przedziału [0-100] w polu "Prawy"';
                $scope.error = true;
            }else {
                $scope.error_msg = "";
                $scope.error = false;
                console.log("[emit] server_user_nsp:update_speed, " + $scope.robot.control_socketId);
                Socket.emit("server_user_nsp:update_speed", {
                    motor_a_speed : $scope.robot.motor.motor_a_speed,
                    motor_b_speed : $scope.robot.motor.motor_b_speed,
                    robotId : $scope.robot.control_socketId
                });
            }
        }

        $scope.go_forward = function () {
            if (!key_down) {
                key_down = true;
                console.log("robot go_forwad");
                $scope.robot.motor.motor_a_mode = "cw";
                $scope.robot.motor.motor_b_mode = "ccw";
                console.log("[emit] server_user_nsp:robot_go_forward");
                Socket.emit("server_user_nsp:robot_go_forward", {
                    motor_a_mode : $scope.robot.motor.motor_a_mode,
                    motor_b_mode : $scope.robot.motor.motor_b_mode,
                    robotId : $scope.robot.control_socketId
                });
            }
        }

        $scope.go_backward = function () {
            if (!key_down) {
                key_down = true;
                console.log("robot go_backward");
                $scope.robot.motor.motor_a_mode = "ccw";
                $scope.robot.motor.motor_b_mode = "cw";
                console.log("[emit] server_user_nsp:robot_go_backward");
                Socket.emit("server_user_nsp:robot_go_backward", {
                    motor_a_mode : $scope.robot.motor.motor_a_mode,
                    motor_b_mode : $scope.robot.motor.motor_b_mode,
                    robotId : $scope.robot.control_socketId
                });
            }
        }

        $scope.go_left = function () {
                console.log("robot go_left");
        }

        $scope.go_right = function () {
                console.log("robot go_right");
        }

        $scope.decrease_dir_angle = function () {
            if ($scope.change_direction_by > 0) {
                console.log("decrease direction angle");
                $scope.$apply($scope.change_direction_by -= 1);
            }
        }

        $scope.increase_dir_angle = function () {
            if ($scope.change_direction_by < 180) {
                console.log("increase direction angle");
                $scope.$apply($scope.change_direction_by += 1);
            }
        }

        $scope.left_servo_down = function () {
            if ($scope.robot.servo.angle > -90) {
                console.log("left servo down");
                $scope.$apply($scope.robot.servo.angle = Number($scope.robot.servo.angle) - 1);
            }
        }

        $scope.right_servo_down = function () {
            if ($scope.robot.servo.angle < 90) {
                console.log("right servo down");
                $scope.$apply($scope.robot.servo.angle = Number($scope.robot.servo.angle) + 1);
            }
        }
        $scope.change_servo_angle = function () {
                console.log("[emit] server_user_nsp:robot_change_servo_angle," + $scope.robot.servo.angle);
                Socket.emit("server_user_nsp:robot_change_servo_angle", {
                    servo_angle : $scope.robot.servo.angle,
                    robotId : $scope.robot.control_socketId
                });
        }


        $scope.stop = function () {
            key_down = false;
            console.log('robot stop');
            $scope.robot.motor.motor_a_mode = "stop";
            $scope.robot.motor.motor_b_mode = "stop";
            console.log("[emit] server_user_nsp:robot_stop");
            Socket.emit("server_user_nsp:update_speed", {
                motor_a_speed : $scope.robot.motor.motor_a_speed,
                motor_b_speed : $scope.robot.motor.motor_b_speed,
                robotId : $scope.robot.control_socketId
            });
        }

        $http.get('/api/robots/' + $stateParams.id).then(function (response) {
            $scope.robot = response.data;
            Socket.connect();
        });


        Socket.on("connect", function () {
            console.log("conneted to server from user interface");
            console.log("[emit] server_user_nsp:join_to_robot_chanel:" + $scope.robot.control_socketId);
            Socket.emit("server_user_nsp:join_to_robot_chanel",{chanel:$scope.robot.control_socketId}); //$scope.robot.control_socketId});
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
            Socket.disconnect(true);
            Socket.removeAllListeners();
        });
    }])
;

