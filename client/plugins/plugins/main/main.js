/**
 * Created by victor on 24.03.2016.
 */

(function(){
    "use strict";

    var app = angular.module ('illumination');

    app.directive('jolaMain', [function(){
        return {
            restrict: 'E',
            templateUrl: "plugins/plugins/main/template/template.html",
            controller: 'jolaMainController',
            controllerAs: 'mainCtrl',
            replace: true
        };
    }]);

    app.controller('jolaMainController',
        [function(){

            var mainCtrl = this;

            mainCtrl.showing = 'scheduler';

            mainCtrl.show = function (element) {
                mainCtrl.showing = element;
            }

        }]
    );
})();