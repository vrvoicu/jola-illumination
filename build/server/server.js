(function () {
    'use strict';

    var settings = require('./settings.js');
    var architect = require('architect');

    var config = architect.resolveConfig(settings.plugins, __dirname);
    var architectInstance = architect.createApp(config);

    architectInstance.on('err', function (err) {
        console.log(err);
    });

    architectInstance.on('service', function (service) {

    });

    architectInstance.on ('plugin', function (plugin) {
        console.log('Plugin loaded: '+plugin.provides);
    });

    architectInstance.on ('ready', function (app) {
        //debug ('Registering routes');
        architectInstance.services.server.registerRoutes ();
        architectInstance.services.server.listRoutes ();
    });

})();

/*
var express = require('express');
var app = express();

var request = require('request');
var htmlparser = require("htmlparser2");

// respond with "hello world" when a GET request is made to the homepage
app.get('/', function(req, res) {
    //res.send('hello world');

    request("http://forum.computergames.ro/223-componente-pc-procesoare-memorii-placi-de-baza.html", function(error, response, body) {

        var tags = [
            {
                name: 'li',
                class: 'threadbit'
            },
        ];

        var handler = new htmlparser.DomHandler(function (error, dom) {
            if (error){

            }
            else{
                parseDom(dom);
                res.status(200).send();
            }
        });
        var parser = new htmlparser.Parser(handler);
        parser.parseChunk(body);
        parser.done();

    });
});

function parseDom(dom){
    var htmlTag = getTag(dom, 'html');
    var bodyTag = getTag(htmlTag.children, 'body');

    for(var index=0; index<bodyTag.children.length; index++)
        parseTag(bodyTag.children[index]);
}

function parseTag(tag){

    if(tag.name == 'li')
        console.log(tag.attribs);

    if(tag.children)
        for(var index=0; index<tag.children.length; index++)
            parseTag(tag.children[index]);
}


function getTag(dom, tagName){
    for(var index = 0; index < dom.length; index++)
        if(dom[index].name == tagName)
            return dom[index];
}

app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
});*/
