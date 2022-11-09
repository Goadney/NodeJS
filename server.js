//import express
var express = require('express');
var bodyParser = require('body-parser');
var apiRouter = require('./apiRouter').router;

// instanciate server 
var server = express();

//body parser conf

server.use(bodyParser.urlencoded({extended: true}));
server.use(bodyParser.json());

//configure route

server.get('/',function(req,res){ 

    res.setHeader('Content-Type','text/html');
    res.status(200).send('<h1>Bonjour ca ca ? oui </h1>');


});

server.use('/api/', apiRouter);
//launch serv

server.listen(8080, function(){ 
    console.log("Le serveur écoute");

}
)