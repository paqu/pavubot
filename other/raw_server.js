var net = require('net');

var PORT = 9000;
var server = net.createServer();

server.on('connection', handleConnection);

server.listen(PORT, function() {
    console.log('server listening to %j', server.address());
});

function handleConnection(conn) {
    var remoteAddress = conn.remoteAddress + ":" + conn.remotePort;
    console.log('new client connection from %s', remoteAddress);

    conn.setEncoding('utf8');

    conn.on('data', onConnData);
    conn.once('close',onConnClose);
    conn.on('error', onConnError);

    function onConnData(d) {
        console.log('connection data from %s: %j', remoteAddress,d);
        conn.write(d.toUpperCase());
    }

    function onConnClose() {
        console.log('close from %s', remoteAddress);
    }

    function onConnError(err) {
        console.log('Connection %s error: %s', remoteAddress, err.message);
    }
}
