var scheduler = require('node-schedule');
var async = require("async");

(function(){
	"use strict";

	module.exports = function setup (options, imports, register)
	{

		var server = imports.server;
		var raspberry_gpio = imports.raspberry_gpio;

		function random (low, high) {
			return Math.random() * (high - low) + low;
		}

        function getHoursBetween(startHour, endHour){
            var now = new Date();
            var remainingTime = 0;
            if(endHour> startHour){
                startHour = Math.max(startHour, now.getHours());
                remainingTime = endHour - startHour;
            }
            else {
                remainingTime = endHour + (24 - startHour);
            }

            return remainingTime;
        }

		var scheduledJobs = [];

        var startHour = 20;
		var endHour = 5;
        var minMinutes = 15, maxMinutes = 60;
        var now = new Date();
		var remainingTime = getHoursBetween(startHour, endHour) * 60;
        var fromNowInMinutes = Math.ceil(random(minMinutes, maxMinutes));

		while((remainingTime - fromNowInMinutes) > 0){

			var hours = now.getHours();
			var minutes = now.getMinutes();

			if(minutes + fromNowInMinutes > 60) {
                minutes = (minutes + fromNowInMinutes) % 60;
                hours += 1;
            }
            else{
                minutes = (minutes + fromNowInMinutes);
            }

            remainingTime -= fromNowInMinutes;
            fromNowInMinutes = Math.ceil(random(minMinutes, maxMinutes));

			var timeFromNow = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0);
            now = timeFromNow;

			var job = scheduler.scheduleJob(timeFromNow, function(){

                var gpios = raspberry_gpio.gpios;
                async.each(gpios, function(pin, callback) {
                    raspberry_gpio.getPinState(pin, function (err, value) {
                        console.log(err);
                        console.log(value);
                        callback(err, value);
                    });
                }, function(err){
                    console.log(err);
                    //console.log(results);
                    // results now equals an array of the existing files
                });

			});

            scheduledJobs.push(job);

            console.log(fromNowInMinutes);
            console.log(timeFromNow);
		}

        function createClosingJob(endHour)
        {
            var rule = new scheduler.RecurrenceRule();
            rule.hour = endHour;
            rule.minutes = 36;

            var job = scheduler.scheduleJob(rule, function () {
                var gpios = raspberry_gpio.gpios;
                for (var index = 0; index < gpios.length; index++) {
                    (function (gpio) {
                        raspberry_gpio.getPinState(gpio, function (err, value) {
                            if(!err)
                                raspberry_gpio.setPinToLow(gpio, function (err) {
                                    console.log("aaaaa");
                                });
                        });
                    })(gpios[index]);
                }
            });
            scheduledJobs.push(job);
        }

        createClosingJob(10);

		server.registerForRoutes("/hourInterval", 50, function (router) {
			/*router.get("", function (req, res) {


				gpio.open(7, "output", function(err) {		// Open pin 16 for output
					/!*gpio.write(7, 1, function() {			// Set pin 16 high (1)
					 //gpio.close(7);						// Close pin 16
					 });*!/
				});

				res.status(200).send();
			});*/

			router.get("", function(req, res){

                var gpios = raspberry_gpio.gpios;
                var gpiosStates = [];
                async.each(gpios, function(pin, callback) {
                    raspberry_gpio.getPinState(pin, function (err, value) {
                        if(err)
                            return callback(err);

                        gpiosStates.push({gpio: pin, state: value});

                        callback();
                    });
                }, function(err){
                    if(err)
                        return res.status(500).send();

                    res.status(200).send(gpiosStates);
                });

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



