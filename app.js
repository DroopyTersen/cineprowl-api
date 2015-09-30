var restify = require('restify'),
	server = restify.createServer(),
	movieService = new (require("CineProwl-Services")).MovieService(),
	breezeMongo = require("breeze-mongodb"),
	models = require("CineProwl-Models"),
	imageHelper = models.imageHelper;
	
server.use(restify.queryParser());
server.use(restify.CORS());
server.use(restify.jsonp());
server.use(restify.bodyParser());

var transaction = function(method, res, params) {
	movieService[method].apply(movieService, params).then(function(result) {
		res.send(result);
	}).fail(function(error){
		res.send(error);
	});
};

var isNullOrEmpty = function(obj) {
	if (obj) {
		return Object.keys(obj).length === 0;	
	}
	return false;
};

var defaults = {
	query: { id : { $ne: null}},
	fields: models.ThinMovie.fields,
	options: {
		sort: {
			addedToDb: -1
		},
		skip:  0,
		limit: 50
	}
};

var odataToMongo = function	(req) {
	var mongoQuery =  new breezeMongo.MongoQuery(req.query);
	return {
		query: isNullOrEmpty(mongoQuery.filter) ? defaults.query : mongoQuery.filter,
		fields: isNullOrEmpty(mongoQuery.select) ? defaults.fields : mongoQuery.select,
		options: isNullOrEmpty(mongoQuery.options) ? defaults.options : mongoQuery.options
	};
};


server.get("/config", function(req, res) {
    var config = {
    	images: {
    		baseUrl: "http://image.tmdb.org/t/p/",
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
});

server.get("/genres/:id", function(req, res) {
	var query = { "genres.name": req.params.id};
	if (req.query){
		var mongoQuery =  odataToMongo(req)
		mongoQuery.query["genres.name"] = req.params.id;
		mongoQuery.fields["_id"] = -1;
		transaction("_find", res,  [ mongoQuery, null]);
	} else {
		transaction("query", res, [query, null, 0, 2000]);
	}
	
})

/* === MOVIES === */
server.get("/movies", function(req, res) {
	
	if (isNullOrEmpty(req.query)) {
		var params1 = [
			defaults.query,
			null,
			0,
			2000
		];
		transaction("query", res, params1);	
		
	} else {
		var mongoQuery =  odataToMongo(req)
		var params2 = [ mongoQuery, null];
		//res.send(params2);
		transaction("_find", res, params2);
	}

});

server.post("/movies", function() {

});
server.put("/movies", function(req, res) {
	res.send("here");
});

server.get("/movies/:id", function(req, res) {
	transaction("getById", res, [req.params.id]);
});

server.put("/movies/:id", function(req, res) {
	var update = JSON.parse(req.body);
	update.id = req.params.id;
	transaction("update", res, [req.params.id], update);
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
var host = process.env.IP;
if (host) {
	server.listen(port, host, function() {
  		console.log('REST API server listening on port ' + host + ":" + port);
	});
} else {
	server.listen(port, host, function() {
  		console.log('REST API server listening on port ' + port);
	});
}


module.exports = server;