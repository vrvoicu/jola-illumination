/**
 * Created by victor on 24.02.2016.
 */
(function(){
    "use strict";

    var module = angular.module('illumination', ["btford.socket-io", "ui.bootstrap", "ui.bootstrap.datetimepicker"]);

    module.config([function () {
    }]);

    module.factory("socket", function (socketFactory) {
        return socketFactory();
    });
    
    module.factory("eventEmitter", function () {

        var service = {
        };

        var e = Emitter;
        e(service);

        return service;
    });
})();