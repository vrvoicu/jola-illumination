/**
 * Created by victor on 21.03.2016.
 */

(function(){
    "use strict";

    var app = angular.module ('illumination');

    app.directive('gpio', [function(){
        return {
            restrict: 'E',
            templateUrl: "plugins/plugins/gpios/template/template.html",
            controller: 'gpioController',
            controllerAs: 'gpioCtrl',
            replace: true
        };
    }]);

    app.controller('gpioController',
        ["gpioService", "$timeout", 'socket', 'eventEmitter', function(gpioService, $timeout, socket, eventEmitter){

            var gpioCtrl = this;

            socket.on('update', function (gpios) {
                for (var index = 0; index < gpioCtrl.gpios.length; index++)
                    for (var secondIndex = 0; secondIndex < gpios.length; secondIndex++)
                        if (gpioCtrl.gpios[index].gpio == gpios[secondIndex].gpio)
                            gpioCtrl.gpios[index].state = gpios[secondIndex].state;

                for(var index = 0; index < gpioCtrl.gpios.length ; index++)
                    $("[name='bootstrap-switch-"+gpioCtrl.gpios[index].gpio+"']").bootstrapSwitch('state', gpioCtrl.gpios[index].state);

            });


            eventEmitter.on('enableGpios', function () {
                for(var index = 0; index < gpioCtrl.gpios.length ; index++) {
                    $("[name='bootstrap-switch-" + gpioCtrl.gpios[index].gpio + "']").bootstrapSwitch('disabled', false);
                }
                socket.emit("getUpdate");
            });

            eventEmitter.on('disableGpios', function () {
                for(var index = 0; index < gpioCtrl.gpios.length ; index++) {
                    $("[name='bootstrap-switch-" + gpioCtrl.gpios[index].gpio + "']").bootstrapSwitch('disabled', true);
                }
            });

            gpioService.getGPIOs(function (gpios) {
                gpioCtrl.gpios = gpios;

                $timeout(function () {
                    for(var index = 0; index < gpioCtrl.gpios.length ; index++) {
                        var bootstrapSwitch = $("[name='bootstrap-switch-"+gpioCtrl.gpios[index].gpio+"']").bootstrapSwitch();
                        bootstrapSwitch.on('switchChange.bootstrapSwitch', function (event, state) {
                            var gpio = event.currentTarget.attributes.customid.value;
                            gpioService.setGPIOs(gpio, state, function () {
                            });
                        });
                    }

                    for(var index = 0; index < gpioCtrl.gpios.length ; index++)
                        $("[name='bootstrap-switch-"+gpioCtrl.gpios[index].gpio+"']").bootstrapSwitch('state', gpioCtrl.gpios[index].state);

                },100);

            });

        }]
    );

    app.service('gpioService',
        ["$http", function ($http) {

            var service = {

                getGPIOs: function(callback){
                    var promise = $http.get('/gpio');
                    promise.then(function (response) {
                        callback(response.data);
                    }, function (err) {
                        callback([]);
                        console.log(err);
                    });
                },
                setGPIOs: function(gpio, state, callback){
                    $http.put('/gpio', {gpio: gpio, state: state}, {headers: {'Content-Type': 'application/json'}});
                }


            };

            return service;
        }]
    )
})();