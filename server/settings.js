(function () {
    'use strict';
    // this function is strict...

    var path = require('path');

    var config =
    {
        plugins: [
            {
                packagePath: "./plugins/server-base",
                port: 3000,
                maxPriority: 100,
                clientPath: process.env.PWD+path.sep+"build"+path.sep+"client"/*+path.sep+"source"*/,
                clientUrlPath: '/'
            },
            /*"./plugins/mysql-settings",*/
            "./plugins/socket-listener",
            /*"./plugins/raspberry-gpio",*/
            /*"./plugins/scheduler",*/
            "./plugins/raspberry-camera",
            "./plugins/camera-socket-transmitter"
        ]
    };

    module.exports = config;
}());