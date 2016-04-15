(function(){
    "use strict";
    module.exports = function setup (options, imports, register)
    {

        var socket_listener = imports.socket_listener;
        var raspberry_camera = imports.raspberry_camera;


        socket_listener.on('connection', function (socket) {

        });

        raspberry_camera.onStart(function () {
        });

        raspberry_camera.onStop(function () {
            raspberry_camera.stop();
            raspberry_camera.start();
        });

        raspberry_camera.start();

        var now = new Date().getTime();


        raspberry_camera.onCapture(function (err, timestamp, filename) {
            /*console.log("aaaa");*/
            console.log(new Date().getTime() - now);
            now = new Date().getTime();
        });

        register (null,
            {
                example:
                {

                }
            });
    };

})();
