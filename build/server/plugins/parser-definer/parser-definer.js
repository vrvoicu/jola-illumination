(function(){
	"use strict";

	module.exports = function setup (options, imports, register)
	{

		var server = imports.server;

		server.registerForRoutes("/a", 10, function (router) {
			router.get("/", function (req, res) {
				res.status(200).send();
			});
		});

		server.registerForRoutes("/a", 10, function (router) {
			//console.log(router);
			router.post("/", function (req, res) {

			});
		});

		/*server.registerForRoutes(10, function (router) {
			//console.log(router);
			router.get("/", function (req, res) {
				res.status(200).send();
			});
		});*/

		register (null,
				{
					parser_definer:
					{

					}
				});
	};
})();



