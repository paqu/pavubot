var net = require('net');

var PORT = 1234;
var HOST = 'localhost';

var client = new net.Socket();
client.connect(PORT, HOST, function() {
    console.log('Connected');
    client.write('Hallo, server bla bal bla !!!');
});

client.on('data', function(data) {
    console.log('Received:' + data);
    client.destroy();
});

client.on('close', function() {
    console.log('Connection closed');
});

