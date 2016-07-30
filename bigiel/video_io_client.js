var io = require('socket.io-client');
var fs = require('fs')
var commandLineArgs = require('command-line-args');
var logger = require('../lib/logger');

var options = commandLineArgs([
        { name : 'host',alias:'h', type: String },
        { name : 'port',alias:'p', type: Number },
]);

var PORT = options.port;
var HOST = options.host;

if (!PORT)
    PORT = 1234;

if (!HOST)
    HOST = 'localhost/video';

var url = 'http://'+ HOST + ':' + PORT+'/video';

var conn = io('http://localhost:1234/video');


conn.on('connect', function (data) {
    logger('Connected');
});

conn.on('disconnect', function () {
});

conn.on('connect_error', function (err) {
    logger("Connect error: " + err);
});

conn.on('connect_timeout', function () {
    logger("Connect timeout");
});

conn.on('reconnect', function (attempt_number) {
    logger("Reconnect after  [" + attempt_number + "]");
});

conn.on('reconnect_attempt', function () {
    logger("Reconnect attempt");
});

conn.on('reconnection', function (nr) {
    logger("Reconnectiong nr " + nr);
});

conn.on('reconnect_error', function (err) {
    logger("Recconect error: " + err);
});

conn.on('reconnect_failed', function () {
    logger("Recconect failed");
});

conn.on('error', function (err) {
    logger("Error: " + err);
});

conn.on('video:video_socketId', function (data) {
    logger('get socket id:'+ data.socketId + ' from server.');
    writeToFile('dev/ddal/socket/video_socketId', data.socketId);
});


function writeToFile(path, value) {
    fs.writeFile(path, value, (err) => {
          if (err) throw err;
          logger('Saved socket id (' + value +') to ' + path);
    });
}






