var _               = require('lodash');
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
var robot_nr = 0


function controlConnection (socket) {
    var robot;
    var addressIP = socket.handshake.address;
    var control_socketId = socket.id;

    logger("Control connection from " + addressIP + ", socket id: " + socket.id);

    socket.on('server:init', function (data) {
        robot = _.merge({'control_socketId':control_socketId}, data);
        robot = _.merge({'_id':new ObjectID()}, robot);
        robot = _.merge({'name':'robot_' + robot_nr}, robot);
        robot_nr++;
        robots.push(robot);
        logger("Control: robot was added");
        logger("Robot:" + JSON.stringify(robot));
        user_nsp.emit('user:add_robot', {robot:robot});    
    });

    socket.on('server:update_video_socketId', function (data) {
        logger("Update video socketId " + data.video_socketId);
        for (var index = 0; index < robots.length; index++)
            if (robots[index].control_socketId == socket.id)
                break;


        robots[index].video_socketId = data.video_socketId;
        user_nsp.emit('user:update_video_socketId', {
            video_socketId:robots[index].video_socketId,
            id:robots[index]._id
        });    
        user_nsp.in(socket.id).emit('user_robot:update_video_socketId', {
            video_socketId:robots[index].video_socketId,
        });    
    });

    socket.on('server:update_encoder_distance_a',function (data){
        logger("Control:[on] server:update_encoder_distance_a: " + JSON.stringify(data));
        robots[robots.indexOf(robot)].encoder.distance_a = data.encoder_distance_a;
        logger("Control:[emit] user_robot:update_encoder_distance_a: " + JSON.stringify(data));
        user_nsp.in(socket.id).emit('user_robot:update_encoder_distance_a',
                {encoder_distance_a:data.encoder_distance_a});
    });

    socket.on('server:update_encoder_distance_b',function (data){
        logger("Control:[on] server:update_encoder_distance_b: " + JSON.stringify(data));
        robots[robots.indexOf(robot)].encoder.distance_b = data.encoder_distance_b;
        logger("Control:[emit] user_robot:update_encoder_distance_b: " + JSON.stringify(data));
        user_nsp.in(socket.id).emit('user_robot:update_encoder_distance_b'
                ,{encoder_distance_b:data.encoder_distance_b});
    });

    socket.on('server:update_distance_sensor_sonar',function (data){
        logger("Control:[on] server:update_distance_sensor_sonar: " + JSON.stringify(data));
        robots[robots.indexOf(robot)].distance_sensor.sonar = data.distance_sensor_sonar;
        logger("Control:[emit] user_robot:update_distance_sensor_sonar: " + JSON.stringify(data));
        user_nsp.in(socket.id).emit('user_robot:update_distance_sensor_sonar'
                ,{distance_sensor_sonar:data.distance_sensor_sonar});
    });

    socket.on('server:update_distance_sensor_infrared',function (data){
        logger("Control:[on] server:update_distance_sensor_infrared: " + JSON.stringify(data));
        robots[robots.indexOf(robot)].distance_sensor.infrared = data.distance_sensor_infrared;
        logger("Control:[emit] user_robot:update_distance_sensor_infrared: " + JSON.stringify(data));
        user_nsp.in(socket.id).emit('user_robot:update_distance_sensor_infrared'
                ,{distance_sensor_infrared:data.distance_sensor_infrared});
    });

    socket.on('disconnect', function() {
        logger("Control:disconnet from : " + addressIP + ' socketId:' + socket.id);
        user_nsp.emit('user:remove_robot', {id:robot._id});
        robots.splice(robots.indexOf(robot),1);
        user_nsp.in(socket.id).emit('user_robot:remove_robot');
    });
}



function videoConnection(socket) {
    var addressIP = socket.handshake.address;
    logger("Video connection from " + addressIP + ", socket id: " + socket.id);

    logger("Send socket id " + socket.id + " to " + addressIP);
    socket.emit('video:video_socketId', { socketId:socket.id});

    socket.on("server_video_nsp:frame", function (data) {
        logger("[on]:server_video_nsp:frame");
        logger("[emit]:user_robot:frame");
        user_nsp.in(socket.id).emit("user_robot:frame",{frame: data.frame});
    });

    socket.on('disconnect', function() {
        logger(" Disconnet: " + addressIP + " socket id: " + socket.id); 
        for (var index = 0; index < robots.length; index++) {
            if (robots[index].video_socketId == socket.id) {
                break;
            }
        }

        if (robots[index] !== undefined) {
            robots[index].video_socketId = 'no connection';
            robots[index].watchers = 0;
            user_nsp.emit('user:update_video_socketId', {
                video_socketId:robots[index].video_socketId,
                id:robots[index]._id
            });    
          //  user_nsp.in(socket.id).emit('user_robot:update_video_socketId', {
            user_nsp.in(robots[index].control_socketId).emit('user_robot:update_video_socketId', {
                video_socketId:robots[index].video_socketId,
        });    
        }

    });
}

function userConnection(socket) {
    var addressIP = socket.handshake.address;
    logger("User connection from " + addressIP + ", socket id: " + socket.id);

    socket.on("server_user_nsp:join_to_robot_chanel", function(data) {
        logger("server:join_to_robot_chanel:"+ data.chanel);
        socket.join(data.chanel);
    });

    socket.on("server_user_nsp:update_speed", function(data) {
        logger("[on] server_user_nsp:update_speed");

        for (var index = 0; index < robots.length; index++) {
            if (robots[index].control_socketId  == data.robotId) {
                break;
            }
        }
        robots[index].motor.motor_a_speed = data.motor_a_speed;
        robots[index].motor.motor_b_speed = data.motor_b_speed;

        logger("[emit] robot:update_speed:" + JSON.stringify(data));

        control_nsp.to(data.robotId).emit('robot:update_speed', {
           motor_a_speed:data.motor_a_speed,
           motor_b_speed:data.motor_b_speed
        });
    });

    var SERVO_CHANGE = "server_user_nsp:robot_change_servo_angle";
    var SERVO_UPDATE = "robot:update_servo_angle";

    socket.on(SERVO_CHANGE, function(data) {
        logger("[on] " + SERVO_CHANGE);

        for (var index = 0; index < robots.length; index++) {
            if (robots[index].control_socketId  == data.robotId) {
                break;
            }
        }
        robots[index].servo.angle = data.servo_angle;

        logger("[emit] "+ SERVO_UPDATE + JSON.stringify(data));
        control_nsp.to(data.robotId).emit(SERVO_UPDATE, {
           servo_angle:data.servo_angle,
        });
    });

    socket.on("server_user_nsp:stop_video", function (data) {
        logger("[on] server_user_nsp:stop_video:" + data.video_chanel);
        logger("[leave]" + socket.id + "leave" + data.video_chanel);
        socket.leave(data.video_chanel);

        for (var index = 0; index < robots.length; index++) {
            if (robots[index].video_socketId == data.video_chanel) {
                break;
            }
        }

        robots[index].watchers--;
        if (robots[index].watchers == 0) {
            logger("[emit] video:stop_video, chenel" + data.video_chanel);
            video_nsp.to(data.video_chanel).emit("video:stop_video");
        }


    });

    socket.on("server_user_nsp:start_video", function (data) {
        logger("[on] server_user_nsp:start_video" + data.video_chanel);
        logger("[join]" + socket.id + "join" + data.video_chanel);
        socket.join(data.video_chanel);

        for (var index = 0; index < robots.length; index++) {
            if (robots[index].video_socketId == data.video_chanel) {
                break;
            }
        }

        robots[index].watchers++;

        if (robots[index].watchers == 1) {
            logger("[emit] video:start_video, chenel" + data.video_chanel);
            video_nsp.to(data.video_chanel).emit("video:start_video");
        }

    });

   socket.on('disconnect', function() {
        logger(" Disconnet: " + addressIP + "," + socket.id);
    });
}

