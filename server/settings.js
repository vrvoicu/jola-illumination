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
            "./plugins/parser-definer"
        ]
    };

    module.exports = config;
}());