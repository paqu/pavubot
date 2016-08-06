var path = require('path');

var config = {
    env: 'development',
    root: path.normalize(__dirname + '/'),
    port: 1234,//process.env.PORT || 9000,
    ip: process.env.IP || '0.0.0.0',
    secrets: {
        session: 'inzApp'
    },


    seedDB: true,
    mongo: {
        uri: 'mongodb://localhost/inzApp-dev',
        options: {
            db: {
                safe: true
            }
        }
    }

    /*
    userRoles = ['quest','user','adimn'];
    */
};

module.exports = config;
