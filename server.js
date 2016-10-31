var restify = require('restify');
var server = restify.createServer();


server.use(restify.queryParser());
server.use(restify.CORS());
server.use(restify.jsonp());
server.use(restify.bodyParser());

require("./src/rotes").configure(server);

var startServer = function () {
	var port = process.env.PORT || 4445;
	var host = process.env.IP;
	server.listen(port, host, function () {
		console.log('REST API server listening on port ' + host + ":" + port);
	});
}

startServer();