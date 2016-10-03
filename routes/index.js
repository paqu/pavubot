var express = require('express');
var path    = require('path');
var router  = express.Router();


module.exports = function (app) {

    app.use('/api/users', require('../api/user'));
    app.use('/auth', require('../auth'));

    app.route('/')
        .get(function(req,res) {
            res.sendFile(path.join(__dirname, '../client/index.html'));
        });
};
