

(function(){
    "use strict";

    var RaspiCam = require("raspicam");
    var path = require('path');

    var videoPath = process.env.PWD+path.sep+"build"+path.sep+"client"+path.sep+"img"+path.sep+"camera1.jpg";
    //var videoPath = process.env.PWD+path.sep+"client.jpg";

    console.log(videoPath);

    var camera = new RaspiCam({
        mode: "timelapse",
        output: videoPath,
        timeout     : 1000*60,
        nopreview   : true,
        thumb: "none",
        //timelapse   : 1000*60*60,
        timelapse   : 100,
        //th          : "0:0:0"
    });

    /*var camera = new RaspiCam({
        mode: "video",
        framerate: 15,
        timeout: 1000*60,
        output: videoPath
    });*/

    console.log();


    module.exports = function setup (options, imports, register)
    {
        register (null,
            {
                raspberry_camera:
                {

                    start: function () {
                        camera.start();
                    },

                    stop: function(){
                        camera.stop();
                    },

                    onStart: function (callback) {
                        camera.on("start", callback);
                    },

                    onStop: function (callback) {
                        camera.on("exit", callback);
                    },

                    onCapture: function(callback){
                        camera.on("read", callback);
                    }

                }
            });
    };

})();
