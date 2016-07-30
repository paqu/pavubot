var fs = require('fs')
var jot = require('json-over-tcp');

var PORT = 9000;
var SERVER_DDAL_ROOT="server/";

var server = jot.createServer();

server.on('connection', handleConnection);

server.listen(PORT, function() {
    console.log('server listening to %j', server.address());
});

function handleConnection(conn) {
    var remoteAddress = conn.remoteAddress + ":" + conn.remotePort;
    console.log('New client connection from %s', remoteAddress);


    conn.on('data', onConnData);
    conn.once('close',onConnClose);
    conn.on('error', onConnError);

    function onConnData(msg) {
        console.log('Received data from %s:\n', remoteAddress);
        console.log(msg);
        fs.writeFile(SERVER_DDAL_ROOT+msg.path,msg.value, (err) => {
            if (err) throw err;
            console.log("Saved: " + msg.value + " to: " + msg.path);
        });


    }

    function onConnClose() {
        console.log('close from %s', remoteAddress);
    }

    function onConnError(err) {
        console.log('Connection %s error: %s', remoteAddress, err.message);
    }
}
