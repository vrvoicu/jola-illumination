(function(){
    "use strict";

    var express = require('express');
    var http = require ('http');
    var bodyParser = require ('body-parser');

    var _ = require ('lodash');

    var colors = require('colors');

    var debug = require('debug')('plugin:server');

    module.exports = function setup (options, imports, register)
    {

        var port = options.port;
        var maxPriority = options.maxPriority;
        var clientPath = options.clientPath;
        var clientUrlPath = options.clientUrlPath;

        var app = express();
        var webserver = http.createServer(app);

        webserver.listen(port);

        app.use (clientUrlPath, express.static(clientPath));

        //body parser
        app.use(bodyParser.urlencoded({ extended: true }));
        app.use(bodyParser.json());

        var routesInfos = [];
        var routers = {};

        var  showOptions = {
            prefix: '',
            spacer: 7
        };

        function spacer(x) {
            var res = '';
            while(x--) res += ' ';
            return res;
        }

        function colorMethod(method) {
            switch(method){
                case('POST'):   return method.yellow;
                case('GET'):    return method.green;
                case('PUT'):    return method.blue;
                case('DELETE'): return method.red;
                case('PATCH'):  return method.grey;
                default:        return method;
            }
        }

        function show () {
            _.each(arguments, function(arg){
                if (_.isString(arg)) {
                    console.info(arg.magenta);
                } else if (_.isObject(arg)) {
                    if(!arg.stack) {
                        _.assign(showOptions, arg);
                    } else {
                        _.each(arg.stack, function(stack){
                            if (stack.route) {
                                // console.log (stack);
                                var route = stack.route,
                                    methodsDone= {};
                                _.each(route.stack, function(r){
                                    var method = r.method ? r.method.toUpperCase() : null;
                                    if(!methodsDone[method] && method){
                                        console.info(colorMethod(method), spacer(showOptions.spacer - method.length), showOptions.prefix + route.path);
                                        methodsDone[method] = true;
                                    }
                                });
                            }
                            else if (stack.name === "router")
                            {
                                console.log ("Router "+stack.handle.serverpath);
                                var oldprefix = showOptions.prefix;
                                showOptions.prefix = stack.handle.serverpath;
                                show (stack.handle);
                                showOptions.prefix = oldprefix;
                            }
                        });
                    }
                }
            });
        }

        register (null,
            {
                server:
                {

                    registerForRoutes: function (route, priority, registerRoutesFunction) {

                        //if root and priority aren't passed
                        if(_.isFunction(route)){
                            registerRoutesFunction = route;
                            priority = maxPriority;
                            route = null;
                        }
                        //if priority isnt passed
                        else if(_.isFunction(priority)){
                            registerRoutesFunction = priority;

                            if(_.isInteger(route)){
                                route = null;
                                priority = route;
                            }
                            else if (_.isString(route)){
                                priority = maxPriority;
                            }
                        }

                        routesInfos.push({route: route, priority: priority, registerRoutes: registerRoutesFunction});
                    },

                    registerRoutes: function () {

                        //sort the routes
                        routesInfos.sort (function (a, b)
                        {
                            return a.priority - b.priority;
                        });


                        _.forEach (routesInfos, function (routeInfo)
                        {
                            //if route has a route
                            if (routeInfo.route)
                            {
                                //debug ('Registering routes with root %s', route.root);
                                //get router for route
                                var router = routers[routeInfo.route];
                                if (!router)
                                {
                                    //get the router from express
                                    router = express.Router ();
                                    //store the new router with its route refference
                                    routers[routeInfo.route] = router;
                                    //load the router in the app
                                    app.use(routeInfo.route, router);
                                    //set the serverpath as the route in the router
                                    router.serverpath = routeInfo.route;
                                }
                                //pass the router to the plugin to register routes
                                routeInfo.registerRoutes(router);
                            }
                            //if routeInfo doesnt have a route
                            else
                            {
                                //debug ('Registering routes without root');
                                //pass the app to the plugin to register routes
                                //app handles directly the path
                                routeInfo.registerRoutes(app);
                            }
                        });

                        //debug ('Registering error handler');
                        app.use(function(err, req, res, next)
                        {
                            /*jshint unused:vars */
                            debug ('Error %s', err);
                            /*logger.error({
                             err: err,
                             reqId: req.reqId
                             }, 'middleware:errorHandler');*/
                            res.status(500).send ();
                        });
                    },

                    listRoutes: function ()
                    {
                        //debug ('Listing routes');
                        show(app._router);
                    }
                }
            });
    };
})();
