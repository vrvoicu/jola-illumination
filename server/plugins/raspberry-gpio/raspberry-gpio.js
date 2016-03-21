var gpio = require("pi-gpio");

(function(){
	"use strict";

	module.exports = function setup (options, imports, register)
	{

		var server = imports.server;

        var gpios = [2,3,4,7,8,9,10,11,14,15,17,18,22,23,24,25,27];
        var gpiosStates = [];

        function getGPIOState(gpioNumber){
            gpio.read(gpioNumber, function (err, value) {
                if(!err)
                    getGPIOStates.put({gpioNumber: gpioNumber, state: value});
            })
        }

		server.registerForRoutes("/gpio", 10, function (router) {
			router.get("/", function (req, res) {

                async.parallel([
                    getGPIOState(2)
                ], function(){
                    res.status(200).send(gpiosStates);
                });

				//res.status(200).send();
			});
		});

		register (null,
				{
					parser_definer:
					{

					}
				});
	};
})();



