var async = require("async");
var gpio = require("pi-gpio");

(function(){
	"use strict";

	module.exports = function setup (options, imports, register)
	{

		var server = imports.server;

		var raspberry_gpio = {

			gpios: [7, 11, 12, 13, 15, 16, 18, 22, 29, 31, 32, 33, 35, 36, 37, 38, 40],

			setPinToHigh : function(pin, callback){

                gpio.open(pin, "output", function(err) {
                    if(err)
                        return callback(err);
                    console.log(err);
                    gpio.write(pin, 1, function (err) {
                        if(err)
                            return callback(err);
                        callback(null);
                    });
                });
			},

			setPinToLow : function(pin, callback){
                gpio.write(pin, 0, function (err) {
                    gpio.close(pin, function (err) {
                        if(err)
                            return callback(err);
                        callback(null);
                    });
                });
                
			},

			getPinState : function(pin, callback){
				gpio.read(pin, function(err, value) {
                    console.log("pin: "+pin+" value: "+value);
					callback(err, value);
				});
			},
            
            closeAllPins: function () {
                var raspberry_gpio = this;
                async.each(raspberry_gpio.gpios, function (pin, callback) {

                    raspberry_gpio.setPinToLow(pin, function (err) {
                        callback();
                    });

                }, function (err) {

                });
            }

		};

        function compare(a,b) {
            if (a.gpio < b.gpio)
                return -1;
            else if (a.gpio > b.gpio)
                return 1;
            else
                return 0;
        }

		server.registerForRoutes("/gpio", 10, function (router) {
			router.get("", function (req, res) {

				var gpios = raspberry_gpio.gpios;
				var gpiosStates = [];
				async.each(gpios, function(pin, callback) {
					raspberry_gpio.getPinState(pin, function (err, value) {
						if(err)
                            gpiosStates.push({gpio: pin, state: false});
                        else
						    gpiosStates.push({gpio: pin, state: value == 1 ? true: value == 0 ? true : false});

						callback();
					});
				}, function(err){
					if(err)
						return res.status(500).send();

                    gpiosStates.sort(compare);

					res.status(200).send(gpiosStates);
				});
			});

			router.put("", function(req, res){
				var gpioId = req.body.gpio;
				var state = req.body.state;

				if(state == true )
                    raspberry_gpio.setPinToHigh(gpioId, function (err) {
                        //console.log(err);
                        if(err)
                            res.status(500).send();
                        res.status(200).send();
                    });
				else
                    raspberry_gpio.setPinToLow(gpioId, function (err) {
                        //console.log(err);
                        if(err)
                            res.status(500).send();
                        res.status(200).send();
                    });

			});
		});

		register (null,{raspberry_gpio: raspberry_gpio});
	};
})();



