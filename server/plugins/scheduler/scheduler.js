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

        function getTimeBetween(startTime, endTime){
            startTime = startTime.trim();
            endTime = endTime.trim();

            var startHour = parseInt(startTime.split(":")[0]);
            var startMinute = parseInt(startTime.split(":")[1]);

            var endHour = parseInt(endTime.split(":")[0]);
            var endMinute = parseInt(endTime.split(":")[1]);

            var minutesComputer = function (startHour, startMinute, endHour, endMinute) {

                if(startHour == endHour){
                    if(startMinute > endMinute)
                        return -1;

                    return endMinute - startMinute;
                }
                return (60 - startMinute) + endMinute
            };

            var minutes = minutesComputer(startHour, startMinute, endHour, endMinute);

            var hoursComputer = function (startHour, endHour) {

                if(startHour == 0)
                    startHour = 24;

                if(endHour == 0)
                    endHour = 24;

                if(startHour > endHour)
                    return (24 - startHour) + endHour;

                return endHour - startHour;

            };

            var hours = hoursComputer(startHour, endHour);

            console.log(hours);


            var now = new Date();
            var remainingTime = 0;

            if(endHour == "00:00")
                endHour = "24:00";

            if(endHour> startHour){
                startHour = Math.max(startHour, now.getHours());
                remainingTime = endHour - startHour;
            }
            else {
                remainingTime = endHour + (24 - startHour);
            }

            return remainingTime;
        }

        function createJobs(){
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
            return scheduledJobs;
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
            return job;
        }

        //createClosingJob(10);

        var schedulerState = false;
        var schedulerStartTime = "12:00";
        var schedulerEndTime = "23:00";

		server.registerForRoutes("/scheduler", 50, function (router) {

			router.get("", function(req, res){

                res.status(200).send({
                    state: schedulerState,
                    startTime: schedulerStartTime,
                    endTime: schedulerEndTime
                });

			});

            router.put("", function (req, res) {
                var state = req.body.state;

                //if(schedulerEndTime - schedulerStartTime == 0)
                //    return res.status(500).send({state: schedulerState});

                schedulerState = state;

                if(schedulerState == false)
                    raspberry_gpio.closeAllPins();

                res.status(200).send({state: schedulerState});

            });

            router.put("/interval", function (req, res) {
                var startTime = req.body.startTime;
                var endTime = req.body.endTime;

                schedulerStartTime = startTime;
                schedulerEndTime = endTime;

                //if(schedulerEndTime - schedulerStartTime == 0)
                //    return res.status(500).send();

                if(schedulerState == true) {
                    var timeBetween = getTimeBetween(schedulerStartTime, schedulerEndTime);
                    console.log(timeBetween);
                }

                return res.status(200).send();
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



