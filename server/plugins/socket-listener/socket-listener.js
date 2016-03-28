
(function(){
    "use strict";
    module.exports = function setup (options, imports, register)
    {

        var server = imports.server;

        var io = require('socket.io')(server.httpServer);


        io.on('connection', function (socket) {

            /*socket.emit("test", {ce:"mataaaaa"});

            socket.on('update', function (data) {

                console.log(io.sockets);

                //socket(socket.id)

            });

            socket.on('test', function (data) {

                console.log("socket");
                console.log(data);
                console.log("socket");



            });

            socket.on('disconnect', function () {

                console.log("socket");
                console.log("disconnect");
                console.log("socket");

            });*/


        });

        register (null,
            {
                socket_listener: io
            });
    };

})();
