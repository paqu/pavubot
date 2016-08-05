var path = require('path');
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


app.set('views', config.root + '/server/views');
app.set('view engine', 'html');

app.use(compression());
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(methodOverride());
app.use(cookieParser());


app.set('appPath', path.join(config.root, 'client'));

// for development add env = app.get('env'), if ( env == development ) 
if ('development' === config.env ) {
    app.use(require('connect-livereload')());
}

if ('development' === config.env || 'test' === config.env) {
    app.use(express.static(path.join(config.root, '.tmp')));
    app.use(express.static(app.get('appPath')));
    app.use(morgan('dev'));
    app.use(errorHandler());
}

app.use('/', index);

module.exports = app;
