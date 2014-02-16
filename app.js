var restify = require('restify'),
	server = restify.createServer(),
	movieService = new (require("../Services/MovieService"))();

server.use(restify.queryParser());
server.use(restify.jsonp());
server.use(restify.bodyParser());

var transaction = function(method, res, params) {
	movieService[method].apply(movieService, params).then(function(result) {
		res.send(result);
	});
};

server.get("/movies", function(req, res) {
	var query = { id : { $ne: null}};
	var params = [
		query,
		null,
		0,
		2000
	];
	transaction("query", res, params);
});

server.post("/movies", function() {

});
server.put("/movies", function() {

});

server.get("/movies/:id", function(req, res) {
	transaction("getById", res, [req.params.id]);
});

server.patch("/movies/:id", function() {

});
server.del("/movies/:id", function(req, res) {
	transaction("remove", res, [req.params.id]);
});

server.get("/actors", function(req, res) {
	transaction("actors", res);
});

server.post("/movies/query", function(req, res) {
	var query = JSON.parse(req.body);
	transaction("query", res, [query, null, 0, 2000]);
});

server.get("/movies/search/:query", function(req, res) {
	transaction("search", res, [req.params.query, 2000]);
});

server.listen(4445, function() {
  console.log('REST API server listening on port 4445');
});