var scheduler = require('node-schedule');
var async = require("async");

(function(){
	"use strict";

	module.exports = function setup (options, imports, register)
	{

		var server = imports.server;
		var raspberry_gpio = imports.raspberry_gpio;
        var socket_listener = imports.socket_listener;
        var mysql_setings = imports.mysql_settings;

        var schedulerJobs = [];

        var schedulerState = false;
        var schedulerStartTime = "23:49";
        var schedulerEndTime = "00:00";

        var minMinutes = 15;
        var maxMinutes = 30;

        var isCreatingJobs = false;

		function random (low, high) {
			return Math.random() * (high - low) + low;
		}

        function getHourAndMinute(time){
            var hour = parseInt(time.split(":")[0]);
            var minute = parseInt(time.split(":")[1]);
            return [hour, minute];
        }

        function getTimeBetween(startTime, endTime){
            try {
                startTime = startTime.trim();
                endTime = endTime.trim();

                var startHour = parseInt(startTime.split(":")[0]);
                var startMinute = parseInt(startTime.split(":")[1]);

                var endHour = parseInt(endTime.split(":")[0]);
                var endMinute = parseInt(endTime.split(":")[1]);

                var minutesComputer = function (startHour, startMinute, endHour, endMinute) {

                    if (startMinute == endMinute)
                        return 0;

                    if (startHour == endHour) {
                        if (startMinute > endMinute)
                            return -1;

                        return endMinute - startMinute;
                    }
                    return (60 - startMinute) + endMinute;
                };

                var minutes = minutesComputer(startHour, startMinute, endHour, endMinute);

                var hoursComputer = function (startHour, startMinute, endHour, endMinute) {

                    if (startHour == 0)
                        startHour = 24;

                    if (endHour == 0)
                        endHour = 24;

                    if (startHour > endHour)
                        return (24 - startHour) + endHour;

                    if(startHour < endHour)
                        if(startMinute > endMinute)
                            return (endHour - startHour) -1;

                    return endHour - startHour;

                };

                var hours = hoursComputer(startHour, startMinute, endHour, endMinute);

                var remainingTime = minutes + hours * 60;

                return remainingTime;
            }
            catch (err){
                return -1;
            }
        }

        function createJobs(startHour, startMinute, leftTimeInMinutes, minMinutes, maxMinutes){
            var scheduledJobs = [];

            var now = new Date();
            var fromNowInMinutes = Math.ceil(random(minMinutes, maxMinutes));

            var hours = startHour;
            var minutes = startMinute;
            var day = now.getDate();

            while((leftTimeInMinutes - fromNowInMinutes) > 0){

                if(minutes + fromNowInMinutes > 60) {
                    minutes = (minutes + fromNowInMinutes) % 60;
                    hours ++;
                }
                else{
                    minutes = (minutes + fromNowInMinutes);
                }

                if(hours > 23) {
                    day++;
                    hours %= 24;
                }

                leftTimeInMinutes -= fromNowInMinutes;
                fromNowInMinutes = Math.ceil(random(minMinutes, maxMinutes));

                var timeFromNow = new Date(now.getFullYear(), now.getMonth(), day, hours, minutes, 0);
                now = timeFromNow;

                var job = scheduler.scheduleJob(timeFromNow, function () {

                    raspberry_gpio.closeAllPins(function () {
                        var pin = raspberry_gpio.getNextRandomPin();

                        raspberry_gpio.setPinToHigh(pin, function (err) {
                            //console.log(err);

                            /*raspberry_gpio.getPinStates(function (gpios) {
                             socket_listener.sockets.emit('update', gpios);
                             });*/

                        });

                    });

                });

                scheduledJobs.push(job);

                /*for(var index = 0; index < 60; index += 2) {

                    var timeFromNow = new Date(now.getFullYear(), now.getMonth(), day, hours, minutes, index);
                    now = timeFromNow;

                    console.log(timeFromNow);

                    var job = scheduler.scheduleJob(timeFromNow, function () {

                        raspberry_gpio.closeAllPins(function () {
                            var pin = raspberry_gpio.getNextRandomPin();

                            raspberry_gpio.setPinToHigh(pin, function (err) {
                                //console.log(err);

                                /!*raspberry_gpio.getPinStates(function (gpios) {
                                    socket_listener.sockets.emit('update', gpios);
                                });*!/

                            });

                        });

                    });
                    scheduledJobs.push(job);
                }*/
            }
            return scheduledJobs;
        }

        function createStartingJob(){

            var jobHourAndMinute = getHourAndMinute(schedulerStartTime);

            var rule = new scheduler.RecurrenceRule();
            rule.hour = jobHourAndMinute[0];
            rule.minute = jobHourAndMinute[1];

            var job = scheduler.scheduleJob(rule, function () {

                var timeBetween = getTimeBetween(schedulerStartTime, schedulerEndTime);
                console.log(timeBetween);
                var hourAndMinute = getHourAndMinute(schedulerStartTime);
                var jobs = createJobs(hourAndMinute[0], hourAndMinute[1]-1, timeBetween, minMinutes, maxMinutes);

                schedulerJobs = jobs;
                schedulerJobs.push(this);

            });

            schedulerJobs.push(job);
        }

        function createClosingJob() {

            var jobHourAndMinute = getHourAndMinute(schedulerEndTime);

            var rule = new scheduler.RecurrenceRule();
            rule.hour = jobHourAndMinute[0];
            rule.minutes = jobHourAndMinute[1];

            var job = scheduler.scheduleJob(rule, function () {

                raspberry_gpio.closeAllPins(function(){});

            });

            schedulerJobs.push(job);
        }

        function getSchedulerTime(time){

            mysql_setings.getSetting(time, function (err, value) {

                if(err)
                    return console.log(err);

                if(value.length == 0)
                    return setSchedulerTime(time);

                if(time == 'startTime')
                    schedulerStartTime = value[0].value;
                else if(time == 'endTime')
                    schedulerEndTime = value[0].value;

            });
        }

        function setSchedulerTime(time){

            var schedulerTime = null;

            if(time == 'startTime')
                schedulerTime = schedulerStartTime;
            else if(time == 'endTime')
                schedulerTime = schedulerEndTime;

            mysql_setings.setSetting(time, schedulerTime, function (err) {
                if(err)
                    console.log(err);
            });
        }

        getSchedulerTime('startTime');
        getSchedulerTime('endTime');

        socket_listener.on('connection', function (socket) {

            socket.on('getUpdate', function () {
                raspberry_gpio.getPinStates(function (gpios) {
                    socket.emit('update', gpios);
                });
            });

        });

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
                //    return res.status(500).send({state: schedulerState}

                if(state == schedulerState) {
                    return res.status(200).send({state: schedulerState});
                }

                schedulerState = state;

                if(schedulerState == false) {

                    if(isCreatingJobs)
                        return res.status(500).send({state: true});

                    if(schedulerJobs.length > 0) {
                        for (var index = 0; index < schedulerJobs.length; index++)
                            if(schedulerJobs[index] != null)
                                schedulerJobs[index].cancel();
                        schedulerJobs = [];
                    }

                    raspberry_gpio.closeAllPins(function(){
                        res.status(200).send({state: false});
                        /*raspberry_gpio.getPinStates(function (gpios) {
                            socket_listener.sockets.emit('update', gpios);
                        });*/
                    });
                }
                else if(schedulerState == true){

                    isCreatingJobs = true;

                    createStartingJob();
                    createClosingJob();

                    isCreatingJobs = false;

                    res.status(200).send({state: schedulerState});

                }

            });

            router.put("/interval", function (req, res) {

                var startTime = req.body.startTime;
                var endTime = req.body.endTime;

                var timeBetween = getTimeBetween(startTime, endTime);

                if(timeBetween <= 0)
                    return res.status(500).send();

                schedulerStartTime = startTime;
                schedulerEndTime = endTime;

                setSchedulerTime('startTime');
                setSchedulerTime('endTime');

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



