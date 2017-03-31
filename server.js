var bodyParser = require("body-parser");
var express = require("express");

var env = process.env.NODE_ENV || 'dev';
var config = { port: process.env.PORT || 4445 };

var app = express();
app.use(bodyParser.json());
//Enable CORS
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

require("./src/routes").configure(app);

var startServer = function () {
	app.listen(config.port, () => console.log("Server running on port " + config.port))
}

startServer();