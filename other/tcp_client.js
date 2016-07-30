var chokidar = require('chokidar');
var fs = require('fs')
var jot = require('json-over-tcp');
var commandLineArgs = require('command-line-args');

var cli = commandLineArgs([
        { name : 'filenames',alias:'f',multiple:true, type: String },
        { name : 'host',alias:'h', type: String },
        { name : 'port',alias:'p', type: Number },
]);

var options = cli.parse();

var watcher = chokidar.watch(options.filenames, {
    ignored:/[\/\\]\./,
    persistent: true
});

var PORT = options.port;
var HOST = options.host;

var log = console.log.bind(console);

var client = jot.connect(PORT, HOST, function() {
    console.log('Connected to server');
});


//client.setKeepAlive(true, 1); // po co to jest ???

client.on('data', function(msg) {
        console.log('Received from server:\n');

       /*[[remove_start]]*/
       console.log(msg);
       console.log("All Msg:" + msg);
       console.log("Changed file: " + msg.path);
       console.log("Data to send: " + msg.value);
       /*[[remove_stop]]*/

});

client.on('close', function(){
        console.error('connection closed');
});

client.on('error', function(err){
        console.error('Error', err);
});

watcher.on('change',function(path,stats) {
   fs.readFile(path,'ascii', (err, data) => {
       if (err) throw err;

       var msg = {"path":path,"value":data};
       client.write(msg);

       /*[[remove_start]]*/
       console.log(msg);
       console.log("All Msg:" + msg);
       console.log("Changed file: " + msg.path);
       console.log("Data to send: " + msg.value);
       /*[[remove_stop]]*/
   });
});

