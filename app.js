var path = require('path');
var mongoose    = require('mongoose');
var express     = require('express');
var compression = require('compression');
var bodyParser  = require('body-parser');
var morgan      = require('morgan');
var methodOverride = require('method-override');
var cookieParser   = require('cookie-parser');
var errorHandler   = require('errorhandler');

var index = require('./routes/index.js');

var config = require('./config');
var app = express();

var passport = require('passport');

mongoose.connect(config.mongo.uri,config.mongo.options);
mongoose.connection.on('error', function(err) {
  console.error('MongoDB connection error: ' + err);
  process.exit(-1);
});

if (config.seedDB) { require('./config/seed'); }

app.set('views', config.root + '/server/views');
app.set('view engine', 'html');

app.use(compression());
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(methodOverride());
app.use(cookieParser());
app.use(passport.initialize());



app.set('appPath', path.join(config.root, 'client'));

// for development add env = app.get('env'), if ( env == development ) 
if ('development' === config.env ) {
    app.use(require('connect-livereload')());
}

if ('development' === config.env || 'test' === config.env) {
    app.use(express.static(path.join(config.root, '.tmp')));
    //app.use(express.static(app.get('appPath')));
    app.use(express.static('/home/paqu/inz2/client/'));
    app.use(morgan('dev'));
    app.use(errorHandler());
}

require('./routes')(app);

module.exports = app;
