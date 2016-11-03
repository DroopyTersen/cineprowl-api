var movieService = require("../movieService");
var respond = require("../respond");
var queries = require("../queries");

var transaction = respond.transaction;

exports.configure = function(server) {
    require("./movieRoutes").configure(server);


    server.get("/actors", (req, res) => transaction("actors", res));

    server.get("/actors/:id", (req, res) => transaction("filmography", res, [req.params.id]));

    server.get("/actors/search/:query", (req, res) => transaction("searchActors", res, [req.params.query, 2000]))
    server.get("/search/:query", (req, res) => transaction("search", res, [req.params.query, 2000]))
        
    server.get("/stats", (req, res) => respond.async(movieService.stats(), res));

    server.get("/genres", (req, res) => transaction("genres", res));
    server.get("/genres/:id", function (req, res) {
        var query = { "genres.name": req.params.id };
        if (req.query) {
            var mongoQuery = queries.odataToMongo(req)
            mongoQuery.query["genres.name"] = req.params.id;
            mongoQuery.fields["_id"] = -1;
            transaction("_find", res, [mongoQuery, null]);
        } else {
            transaction("query", res, [query, null, 0, 2000]);
        }
    })

    server.get("/config", function (req, res) {
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
}