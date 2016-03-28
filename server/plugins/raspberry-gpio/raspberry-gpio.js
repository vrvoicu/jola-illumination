var async = require("async");
var gpio = require("pi-gpio");

(function(){
	"use strict";

	module.exports = function setup (options, imports, register)
	{

		var server = imports.server;

        function random (low, high) {
            return Math.random() * (high - low) + low;
        }



		var raspberry_gpio = {

			//gpios: [7, 11, 12, 13, 15, 16, 18, 22, 29, 31, 32, 33, 35, 36, 37, 38, 40],
            //gpios: [7, 11, 12, 13],
            gpios: [7, 11],

			setPinToHigh : function(pin, callback){

                gpio.open(pin, "output", function (err) {

                    /*if(err)
                        myc(err);*/

                    gpio.write(pin, 1, function (err) {

                        //socket.emit("test");

                        /*if(err)
                            console.log(err);*/

                        callback(null);
                    });

                });
			},

			setPinToLow : function(pin, callback){

               /* gpio.read(pin, function(err, value) {

                    if(!err)*/
                        gpio.close(pin, function (err) {

                            callback(null);

                        });

                    /*callback(null);

                });*/


                
			},

			getPinState : function(pin, callback){
				gpio.read(pin, function(err, value) {
					callback(err, value);
				});
			},

            getPinStates: function (pinStatesCallback) {

                var gpios = this.gpios;
                var gpiosStates = [];
                var counter = 0;

                async.each(gpios, function(pin, callback) {
                    raspberry_gpio.getPinState(pin, function (err, value) {

                        if(err)
                            gpiosStates.push({gpio: pin, state: false});
                        else
                            gpiosStates.push({gpio: pin, state: value == 1 ? true: false});

                        counter ++;

                        /*if(pin == raspberry_gpio.gpios[raspberry_gpio.gpios.length-1]){
                            callback();
                            pinStatesCallback(gpiosStates);
                        }*/
                        if(counter == raspberry_gpio.gpios.length){
                            callback();
                            pinStatesCallback(gpiosStates);
                        }

                    });
                }, function(err){

                });


            },
            
            closeAllPins: function (myCallback) {
                var raspberry_gpio = this;
                var counter = 0;
                async.each(raspberry_gpio.gpios, function (pin, callback) {

                    raspberry_gpio.setPinToLow(pin, function (err) {

                        counter++;

                        if(counter == raspberry_gpio.gpios.length){
                            callback();
                            myCallback();
                        }

                    });

                }, function (err) {

                });
            },

            lastRandomPinIndex: -1,

            getNextRandomPin: function () {

                var index = Math.round(random(0, this.gpios.length-1));
                var pin = this.gpios[index];

                if(this.lastRandomPinIndex == -1) {
                    this.lastRandomPinIndex = index;
                    return pin;
                }

                while(this.lastRandomPinIndex == index)
                    index = Math.round(random(0, this.gpios.length-1));

                this.lastRandomPinIndex = index;

                return this.gpios[index];

            },

            compare: function (firstPin, secondPin) {
                if (firstPin.gpio < secondPin.gpio)
                    return -1;
                else if (firstPin.gpio > secondPin.gpio)
                    return 1;
                else
                    return 0;
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

                raspberry_gpio.getPinStates(function (gpios) {
                    res.status(200).send(gpios);
                });

			});

			router.put("", function(req, res){
				var gpioId = req.body.gpio;
				var state = req.body.state;

				if(state == true )
                    raspberry_gpio.setPinToHigh(gpioId, function (err) {

                        if(err)
                            res.status(500).send();

                        res.status(200).send();

                    });
				else
                    raspberry_gpio.setPinToLow(gpioId, function (err) {

                        if(err)
                            res.status(500).send();

                        res.status(200).send();
                    });

			});
		});

		register (null,{raspberry_gpio: raspberry_gpio});
	};
})();



