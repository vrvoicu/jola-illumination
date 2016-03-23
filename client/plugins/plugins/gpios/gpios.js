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
            controller: 'gpioCtrl',
            controllerAs: 'ctrl',
            replace: true
        };
    }]);

    app.controller('gpioCtrl',
        ["gpioService", "$timeout", function(gpioService, $timeout){

            var ctrl = this;
            gpioService.getGPIOs(function (gpios) {
                ctrl.gpios = gpios;
            });

            $timeout(function () {
                for(var index = 0; index < ctrl.gpios.length ; index++) {
                    var bootstrapSwitch = $("[name='bootstrap-switch-"+ctrl.gpios[index].gpio+"']").bootstrapSwitch();
                    bootstrapSwitch.on('switchChange.bootstrapSwitch', function (event, state) {
                        var gpio = event.currentTarget.attributes.customid.value;
                        console.log(gpio);
                        console.log(state);
                        gpioService.setGPIOs(gpio, state, function () {

                        });
                    });
                }
            },100);

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