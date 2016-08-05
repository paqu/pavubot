var path = require('path');

var config = {
    env: 'development',
    root: path.normalize(__dirname + '/../'),
    port: 1234,//process.env.PORT || 9000,
    ip: process.env.IP || '0.0.0.0',

    /*
    seedDB: false,
    seedDB: true, // development
    secrets: {
        session: 'inzApp'
    },
    mongo: {
        uri: 'mongodb://localhost/inzApp'
    },
    userRoles = ['quest','adimn'];
    */
};

module.exports = config;
