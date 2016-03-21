/**
 * Created by victor on 24.02.2016.
 */
(function(){
    "use strict";

    var app = angular.module ('website-parser');

    app.directive('vvdevDashboard', [function(){

    }]);

    app.controller('vvdevDashboardCtrl',
        [function(){

        }]
    );
    
    app.service('vvdevDashboardService',
        [function () {

            var dashboard = [];

            var service = {
                makeItDraggable: function(chartElementId, dashboardElementId, onDragCreateCallback, onDragStopCallback){
                    if(!onDragCreateCallback)
                        onDragCreateCallback = function () {};
                    if(onDragStopCallback)
                        onDragStopCallback = function() {};

                    $('#'+chartElementId).draggable({
                        containment: '#'+dashboardElementId,
                        scroll: false,
                        create: onDragCreateCallback,
                        stop: onDragStopCallback
                    });
                }
            }
        }]
    )
})();