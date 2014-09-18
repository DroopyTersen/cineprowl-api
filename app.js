var restify = require('restify'),
	server = restify.createServer(),
	movieService = new (require("CineProwl-Services")).MovieService(),
	imageHelper = require("CineProwl-Models").imageHelper;
	
server.use(restify.queryParser());
server.use(restify.CORS());
server.use(restify.jsonp());
server.use(restify.bodyParser());

var transaction = function(method, res, params) {
	movieService[method].apply(movieService, params).then(function(result) {
		res.send(result);
	});
};

server.get("/config", function(req, res) {
    var config = {
    	images: {
    		baseUrl: "http://d3gtl9l2a4fn1j.cloudfront.net/t/p/",
				posterSizes: ["w92", "w154", "w185", "w342", "w500", "original"],
				backdropSizes: ["w300", "w780", "w1280", "original"],
				profileSizes: ["w45", "w185", "h632", "original"],
				logoSizes: ["w45", "w92", "w154", "w185", "w300", "w500", "original"]
    	}
    };
    res.send(config);
});

server.get("/stats", function(req, res) {
    movieService.stats().then(function(stats){
    	res.send(stats);
    });
});

server.get("/genres", function(req, res) {
    transaction("genres", res);
})
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

server.get("/actors/:id", function(req, res) {
	transaction("filmography", res, [req.params.id]);
});

server.get("/actors/search/:query", function(req, res) {
	transaction("searchActors", res, [req.params.query, 2000]);
});

server.post("/movies/query", function(req, res) {
	var query = JSON.parse(req.body);
	transaction("query", res, [query, null, 0, 2000]);
});

server.get("/movies/search/:query", function(req, res) {
	transaction("searchMovies", res, [req.params.query, 2000]);
});

server.get("/search/:query", function(req, res) {
	transaction("search", res, [req.params.query, 2000]);
});

var port = process.env.PORT || 4445;
var host = process.env.IP || "localhost";

server.listen(port, host, function() {
  console.log('REST API server listening on port 4445');
});