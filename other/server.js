var express = require('express');
var app = express();

app.get('/', function (req,res) {
    res.send('Witaj');
});

app.listen(3000);
/*
var io = require('socket.io').listen(3000);

io.socket.on('connection',function(socket) {
    socket.emit('broadcast', { message:'Hi!'});
    socket.on('clientmessge', function (data) {
        console.log("Client said" + data);
    });
});
*/
