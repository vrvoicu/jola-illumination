/**
 * Created by victor on 14.04.2016.
 */
/**
 * Created by victor on 21.03.2016.
 */

(function(){
    "use strict";

    var app = angular.module ('illumination');

    app.directive('cameraFeed', [function(){
        return {
            restrict: 'E',
            templateUrl: "plugins/plugins/camera-feed/template/template.html",
            controller: 'cameraFeedController',
            controllerAs: 'cameraFeedCtrl',
            replace: true
        };
    }]);

    app.controller('cameraFeedController',
        ["$interval", function($interval){

            var cameraFeedCtrl = this;

            cameraFeedCtrl.interval = $interval(function () {
                $("#camera1").attr("src", "img/camera1.jpg?time="+new Date().getTime());
            }, 200);

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