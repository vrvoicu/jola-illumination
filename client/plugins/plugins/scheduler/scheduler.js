/**
 * Created by victor on 21.03.2016.
 */

(function(){
    "use strict";

    var app = angular.module ('illumination');

    app.directive('jolaScheduler', [function(){
        return {
            restrict: 'E',
            templateUrl: "plugins/plugins/scheduler/template/template.html",
            controller: 'jolaSchedulerController',
            controllerAs: 'schedulerCtrl',
            replace: true
        };
    }]);

    app.controller('jolaSchedulerController',
        ["jolaSchedulerService", "$timeout", function(schedulerService, $timeout){

            var schedulerCtrl = this;

            schedulerCtrl.save = function () {
                var startTimeMoment = $('#datetimepicker-1').data("DateTimePicker").date();
                var endTimeMoment = $('#datetimepicker-2').data("DateTimePicker").date();

                if(startTimeMoment == null || endTimeMoment == null)
                    return;


                var startTime = startTimeMoment.format("HH:mm");
                var endTime = endTimeMoment.format("HH:mm");

                schedulerService.setSchedulerSchedule(startTime, endTime, function (err, result) {
                    if(err)
                        return;


                })
            };

            $timeout(function () {
                $('#datetimepicker-1').datetimepicker({format: "HH:mm"});
                $('#datetimepicker-2').datetimepicker({format: "HH:mm"});
                var bootstrapSwitch = $("[name='bootstrap-switch-scheduler']").bootstrapSwitch();

                bootstrapSwitch.on('switchChange.bootstrapSwitch', function (event, state) {
                    schedulerService.setSchedulerState(state, function (err, result) {
                        console.log(err);
                        console.log(result);

                        schedulerService.setSchedulerState(state, function (err, response) {

                            if(err){
                                console.log(err);
                                return $('[name="bootstrap-switch-scheduler"]').bootstrapSwitch('state', false);
                            }

                            $('[name="bootstrap-switch-scheduler"]').bootstrapSwitch('state', response.state);

                        });

                    })
                });

                schedulerService.getSchedulerState(function (err, response) {
                    if(err) {
                        console.log(err);
                        return $('[name="bootstrap-switch-scheduler"]').bootstrapSwitch('state', false);
                    }

                    var startTimeMoment = moment(response.startTime, "HH:mm");
                    var endTimeMoment = moment(response.endTime, "HH:mm");

                    $('#datetimepicker-1').data("DateTimePicker").date(startTimeMoment);
                    $('#datetimepicker-2').data("DateTimePicker").date(endTimeMoment);

                    $('[name="bootstrap-switch-scheduler"]').bootstrapSwitch('state', response.state);

                    console.log(startTimeMoment);
                    console.log(endTimeMoment);
                });

            },100);

    }]);

    app.service('jolaSchedulerService',
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