var _               = require('lodash');
var cv              = require('opencv');
var path            = require('path'); /* config/index.js */
var logger          = require('simple-logger');
var ObjectID        = require('mongodb').ObjectID;
var socketio_server = require('socket.io');
var http            = require('http');
var app             = require('./app');
var config          = require('./config');
var auth            = require('./auth/auth.service');


app.get('/api/robots/', function (req,res) {
    res.json(robots);
});

app.get('/api/robots/:id/control',auth.hasRole('admin'), function (req,res) {
    var id = req.params.id;
    for (var index = 0; index < robots.length; index++)
        if ( id == robots[index]._id.toString())
            break;

    res.json(robots[index]);
});
app.post('/api/wanted/', function (req,res) {
    var data = {};
    logger("[emit] user:robot:face_recognize to " + req.body.chanel);
    data.recognized_person_id = req.body.recognized_person;
    data.time = req.body.date + "," + req.body.time;
    chanel = '/'+ req.body.chanel;
    video_nsp.in(chanel).emit("user:robot:face_recognize",data);
    res.status(200).json({});
});



var server = http.createServer(app);
var io = new socketio_server(server);

function startServer() {
    server.listen(config.port, config.io, function() {
        logger("Express server listening on " + config.port + ", in "+ app.get('env')+ " mode","gray");
    });
}


setImmediate(startServer);
var control_nsp = io.of('/control');
var video_nsp   = io.of('/video');
var user_nsp    = io.of('/user');

control_nsp.on('connection', controlConnection);
video_nsp.on('connection', videoConnection);
user_nsp.on('connection', userConnection);

var robots = [];

function createRobot(socket_id, address_ip, data){
        var robot;
        robot = _.merge({'control_socket_id':socket_id}, data);
        robot = _.merge({'_id':new ObjectID()}, robot);
        robot = _.merge({'address_ip':address_ip}, robot);
        return robot;
}

function controlConnection (socket) {
    var robot = {dupa:'init'};
    var address_ip = socket.handshake.address;
    var socket_id = socket.id;
    var watchers = 0;

    logger("Control connection from " + address_ip + ", socket id: " + socket_id);

    console.log(robots);
    socket.on("server:control:init_data", function (data) {
        logger("[on] server:control:init_data");
        robot = _.merge({"control_socket_id":socket_id}, data);
        robot = _.merge({"_id":new ObjectID()}, robot);
        robot = _.merge({"address_ip":address_ip}, robot);
        robot = _.merge({"watchers":watchers}, robot);
        robots.push(robot);
        logger("Server:control:robot was added to robots list");
        logger("Robot:" + JSON.stringify(robot));
        logger("[emit] user:robots_list:add_robot");
        user_nsp.emit("user:robots_list:add_robot",{robot:robot});
    });

    socket.on("server:control:update_video_socket_id", function (data) {
        logger("[on] server:control:update_video_socket_id" + data.video_socket_id);
        console.log(robots[0].control_socket_id);
        console.log(socket_id);
        for (var index = 0; index < robots.length; index++) {
            if (robots[index].control_socket_id == socket_id)
                break;

        }
        console.log(index);
        robots[index].video_socket_id = data.video_socket_id;
        logger("[emit] user:robots_list:update_video_socket_id:" + data.video_socket_id);
        user_nsp.emit("user:robots_list:update_video_socket_id", {
            video_socket_id:robots[index].video_socket_id,
            id:robots[index]._id
        });

        logger("[emit] user:robot:update_video_socket_id:" + data.video_socket_id);
        user_nsp.in(socket_id).emit('user:robot:update_video_socket_id', {
            video_socket_id:robots[index].video_socket_id,
        });
    });

    socket.on("server:control:update_left_encoder_distance",function (data){
        logger("[on] server:control:update_left_encoder_distance: " + JSON.stringify(data));
        robots[robots.indexOf(robot)].left_encoder_disatnce = data.left_encoder_distance;
        logger("[emit] user:robot:update_left_encoder_distance: " + JSON.stringify(data));
        user_nsp.in(socket_id).emit("user:robot:update_left_encoder_distance",
                {left_encoder_distance:data.left_encoder_distance});
    });

    socket.on("server:control:update_right_encoder_distance",function (data){
        logger("[on] server:control:update_right_encoder_distance: " + JSON.stringify(data));
        robots[robots.indexOf(robot)].right_encoder_disatnce = data.right_encoder_distance;
        logger("[emit] user:robot:update_right_encoder_distance: " + JSON.stringify(data));
        user_nsp.in(socket_id).emit("user:robot:update_right_encoder_distance",
                {right_encoder_distance:data.right_encoder_distance});
    });

    socket.on("server:control:update_distance_sensor_sonar",function (data){
        logger("Control:[on] server:update_distance_sensor_sonar: " + JSON.stringify(data));
        robots[robots.indexOf(robot)].distance_sensor_sonar = data.distance_sensor_sonar;
        logger("Control:[emit] user_robot:update_distance_sensor_sonar: " + JSON.stringify(data));
        user_nsp.in(socket_id).emit("user:robot:update_distance_sensor_sonar"
                ,{distance_sensor_sonar:data.distance_sensor_sonar});
    });

    socket.on("server:control:update_distance_sensor_infrared",function (data){
        logger("Control:[on] server:update_distance_sensor_infrared: " + JSON.stringify(data));
        robots[robots.indexOf(robot)].distance_sensor_infrared = data.distance_sensor_infrared;
        logger("Control:[emit] user_robot:update_distance_sensor_infrared: " + JSON.stringify(data));
        user_nsp.in(socket_id).emit("user:robot:update_distance_sensor_infrared"
                ,{distance_sensor_infrared:data.distance_sensor_infrared});
    });

    socket.on("disconnect", function() {
        logger("Control:disconnet from : " + address_ip + " socketId:" + socket.id);

        if (robot !== undefined) {
            logger("[emit] user:robots_list:remove_robot, id:" + robot._id);
            user_nsp.emit("user:robots_list:remove_robot", {id:robot._id});
            robots.splice(robots.indexOf(robot),1);
            logger("[emit] user:robot:remove_robot, to chanel:" + socket_id);
            user_nsp.in(socket_id).emit("user:robot:remove_robot");
        }
    });
}



function videoConnection(socket) {
    var address_ip = socket.handshake.address;
    var socket_id = socket.id
    logger("Video connection from " + address_ip + ", socket id: " + socket_id);

    logger("Send socket id " + socket.id + " to " + address_ip);
    socket.emit('video::video_socket_id', { socket_id:socket.id});

    socket.on("server:video:face", function (data) {
        logger("[on]:server:video:face");

        date = new Date();

        day  = date.getDate() + '-' + date.getMonth() + 1 + '-' + date.getFullYear()
        time = date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();

        logger("[save]:save photo ");
        cv.readImage(data.face, function (err,im) {
            if (err) throw err;
            im.save('../face_recognizer/faces_to_recognize/' + socket.id + '.' + day + '.' + time +  '.face.jpg');
        });
    });

    socket.on("server:video:frame", function (data) {
        logger("[on]:server_video_nsp:frame");
        logger("[emit]:user:robot:frame");
        video_nsp.in(socket.id).emit("user:robot:frame",{frame: data.frame});
    });

    socket.on("server:user:stop_video", function (data) {
        logger("[on] server:user:stop_video" + data.video_chanel);

        logger("[leave]" + socket.id + "leave" + data.video_chanel);
        socket.leave(data.video_chanel);

        for (var index = 0; index < robots.length; index++) {
            if (robots[index].video_socket_id == data.video_chanel) {
                break;
            }
        }

        robots[index].watchers--;
        if (robots[index].watchers == 0) {
            logger("[emit] video::stop_video, chenel" + data.video_chanel);
            video_nsp.to(data.video_chanel).emit("video::stop_video");
        }


    });

    socket.on("server:user:start_video", function (data) {
        logger("[on] server:user:start_video" + data.video_chanel);

        logger("[join]" + socket.id + "join" + data.video_chanel);
        socket.join(data.video_chanel);

        for (var index = 0; index < robots.length; index++) {
            if (robots[index].video_socket_id == data.video_chanel) {
                break;
            }
        }

        robots[index].watchers++;
        console.log(robots[index].watchers);

        if (robots[index].watchers == 1) {
            logger("[emit] video:start_video, chenel" + data.video_chanel);
            video_nsp.to(data.video_chanel).emit("video::start_video");
        }

    });

    socket.on('disconnect', function() {
        logger("Video disconnet: " + address_ip + " socket id: " + socket.id);

        for (var index = 0; index < robots.length; index++) {
            if (robots[index].video_socket_id == socket_id) {
                break;
            }
        }

        if (robots[index] !== undefined) {
            console.log("index:" + index);
            robots[index].video_socket_id = 'no connection';
            robots[index].watchers = 0;

            logger("[emit] user:robots_list:update_video_socket_id:no connection");
            user_nsp.emit("user:robots_list:update_video_socket_id", {
                video_socket_id:robots[index].video_socket_id,
                id:robots[index]._id
            });

            logger("[emit] user:robot:update_video_socket_id:no conection");
            user_nsp.in(robots[0].control_socket_id).emit("user:robot:update_video_socket_id", {
                video_socket_id:robots[index].video_socket_id,
        });
        }

    });
}

function userConnection(socket) {
    var address_ip = socket.handshake.address;
    logger("User connection from " + address_ip + ", socket id: " + socket.id);

    socket.on("server:user:join_to_robot_chanel", function(data) {
        logger("server:join_to_robot_chanel:"+ data.chanel);
        socket.join(data.chanel);
    });

    socket.on("server:user:leave_chanel", function(data) {
        logger("server:leave_chanel:"+ data.chanel);
        socket.join(data.chanel);
    });

    socket.on("server:user:go_straight", function(data) {
        logger("[on] server:user:go_straight");
        control_nsp.to(data.robot_id).emit("robot:go_straight", {});
    });

    socket.on("server:user:go_back", function(data) {
        logger("[on] server:user:go_back");
        control_nsp.to(data.robot_id).emit("robot::go_back", {});
    });

    socket.on("server:user:turn_left", function(data) {
        logger("[on] server:user:turn_left");
        control_nsp.to(data.robot_id).emit("robot::turn_left", {});
    });

    socket.on("server:user:turn_right", function(data) {
        logger("[on] server:user:turn_right");
        control_nsp.to(data.robot_id).emit("robot::turn_right", {});
    });

    socket.on("server:user:stop", function(data) {
        logger("[on] server:user:stop");
        control_nsp.to(data.robot_id).emit("robot::stop", {});
    });

    socket.on("server:user:update_speed_both", function(data) {
        logger("[on] server:user:update_speed_both");

        for (var index = 0; index < robots.length; index++) {
            if (robots[index].control_socket_id  == data.robot_id) {
                break;
            }
        }
        robots[index].right_motor_speed = data.right_motor_speed;
        robots[index].left_motor_speed  = data.left_motor_speed;

        logger("[emit] robot::update_speed_both:" + JSON.stringify(data));

        control_nsp.to(data.robot_id).emit('robot::update_speed_both', {
            right_motor_speed : data.right_motor_speed,
            left_motor_speed  : data.left_motor_speed
        });
    });

    var SERVO_CHANGE = "server:user:change_camera_angle_to";
    var SERVO_UPDATE = "robot::change_camera_angle_to";

    socket.on(SERVO_CHANGE, function(data) {
        logger("[on] " + SERVO_CHANGE);

        for (var index = 0; index < robots.length; index++) {
            if (robots[index].control_socket_id  == data.robot_id) {
                break;
            }
        }
        robots[index].camera_angle = data.camera_angle;

        logger("[emit] "+ SERVO_UPDATE + JSON.stringify(data));
        control_nsp.to(data.robot_id).emit(SERVO_UPDATE, {
           camera_angle:data.camera_angle,
        });
    });
/*
    socket.on("server:user:stop_video", function (data) {
        logger("[on] server:user:stop_video" + data.video_chanel);

        logger("[leave]" + socket.id + "leave" + data.video_chanel);
        socket.leave(data.video_chanel);

        for (var index = 0; index < robots.length; index++) {
            if (robots[index].video_socket_id == data.video_chanel) {
                break;
            }
        }

        robots[index].watchers--;
        if (robots[index].watchers == 0) {
            logger("[emit] video::stop_video, chenel" + data.video_chanel);
            video_nsp.to(data.video_chanel).emit("video::stop_video");
        }


    });

    socket.on("server:user:start_video", function (data) {
        logger("[on] server:user:start_video" + data.video_chanel);

        logger("[join]" + socket.id + "join" + data.video_chanel);
        socket.join(data.video_chanel);

        for (var index = 0; index < robots.length; index++) {
            if (robots[index].video_socket_id == data.video_chanel) {
                break;
            }
        }

        robots[index].watchers++;
        console.log(robots[index].watchers);

        if (robots[index].watchers == 1) {
            logger("[emit] video:start_video, chenel" + data.video_chanel);
            video_nsp.to(data.video_chanel).emit("video::start_video");
        }

    });
    */

   socket.on('disconnect', function() {
        logger(" Disconnet: " + address_ip + "," + socket.id);
    });
}

