var express  = require('express');
var passport = require('passport');
var User     = require('../api/user/user.model');
var config = require('../config');

var router = express.Router();

require('./local/passport').setup(User, config);

router.use('/local', require('./local'));

module.exports = router;
