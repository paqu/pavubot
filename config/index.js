var path = require('path');

var config = {
    env: 'development',
    root: path.normalize(__dirname + '/'),
    port: process.env.PORT || 1234,
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
    },
    faces_to_recognize : '../rozpoznawanie_twarzy/faces_to_recognize/',

    userRoles : ['quest','user','admin']
};

module.exports = config;
