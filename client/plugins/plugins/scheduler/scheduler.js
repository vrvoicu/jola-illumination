/**
 * Created by victor on 21.03.2016.
 */

(function(){
    "use strict";

    var app = angular.module ('illumination');

    app.directive('scheduler', [function(){
        return {
            restrict: 'E',
            templateUrl: "plugins/plugins/scheduler/template/template.html",
            controller: 'schedulerController',
            controllerAs: 'schedulerCtrl',
            replace: true
        };
    }]);

    app.controller('schedulerController',
        ["schedulerService", "$timeout",'eventEmitter', function(schedulerService, $timeout, eventEmitter){

            var schedulerCtrl = this;
            schedulerCtrl.state = false;
            schedulerCtrl.error = "";

            schedulerCtrl.dateTimePickers = [new Date(), new Date()];


            function onSchedulerStateChanged(state){
                $('[name="bootstrap-switch-scheduler"]').bootstrapSwitch('state', state);

                if(state == false)
                    eventEmitter.emit("enableGpios");
                else
                    eventEmitter.emit("disableGpios");
            }

            function getHourAndMinute(time){
                var hour = parseInt(time.split(":")[0]);
                var minute = parseInt(time.split(":")[1]);
                return [hour, minute];
            }

            schedulerCtrl.save = function () {

                var startTime = schedulerCtrl.dateTimePickers[0].getHours()+":"+schedulerCtrl.dateTimePickers[0].getMinutes();
                var endTime = schedulerCtrl.dateTimePickers[1].getHours()+":"+schedulerCtrl.dateTimePickers[1].getMinutes();

                schedulerService.setSchedulerSchedule(startTime, endTime, function (err, result) {
                    if(err) {
                        console.log(err);
                        return;
                    }

                })
            };

            eventEmitter.emit('updateGpios');

            /*eventEmitter.on('updateGpios', function () {
                console.log('cccc');
            });*/

            $timeout(function () {
                var bootstrapSwitch = $("[name='bootstrap-switch-scheduler']").bootstrapSwitch();

                bootstrapSwitch.on('switchChange.bootstrapSwitch', function (event, state) {
                    schedulerService.setSchedulerState(state, function (err, result) {

                        schedulerService.setSchedulerState(state, function (err, response) {

                            if(err){
                                console.log(err);
                                return $('[name="bootstrap-switch-scheduler"]').bootstrapSwitch('state', false);
                            }

                            onSchedulerStateChanged(response.state);

                        });

                    })
                });

                schedulerService.getSchedulerState(function (err, response) {
                    if(err) {
                        console.log(err);
                        //return schedulerCtrl.state = false;
                        return $('[name="bootstrap-switch-scheduler"]').bootstrapSwitch('state', false);
                    }

                    var now = new Date();
                    var startHourAndMinute = getHourAndMinute(response.startTime);
                    schedulerCtrl.dateTimePickers[0] = new Date(now.getFullYear(), now.getMonth(), now.getDate(), startHourAndMinute[0], startHourAndMinute[1], 0);
                    var endHourAndMinute = getHourAndMinute(response.endTime);
                    schedulerCtrl.dateTimePickers[1] = new Date(now.getFullYear(), now.getMonth(), now.getDate(), endHourAndMinute[0], endHourAndMinute[1], 0);

                    onSchedulerStateChanged(response.state);
                });

            },100);

    }]);

    app.service('schedulerService',
        ["$http", function ($http) {

            var service = {

                getSchedulerState: function(callback){
                    var promise = $http.get('/scheduler');
                    promise.then(function (response) {
                        callback(null, response.data);
                    }, function (err) {
                        callback(err, null);
                    });
                },

                setSchedulerState: function(state, callback){
                    var promise = $http.put(
                        '/scheduler',
                        {state: state}
                    );
                    promise.then(function (response) {
                        callback(null, response.data);
                    }, function (err) {
                        callback(err, null);
                    });
                },

                setSchedulerSchedule: function (startTime, endTime, callback) {
                    var promise = $http.put(
                        '/scheduler/interval',
                        {startTime: startTime, endTime: endTime}
                    );
                    promise.then(function (response) {
                        callback(null, response.data);
                    }, function (err) {
                        callback(err, null);
                    });
                }

            };

            return service;
        }]
    )
})();