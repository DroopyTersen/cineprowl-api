var odataToMongo = require("../odataToMongo");
var movieService = require("../movieService");
var models = require("cineprowl-models");
var respond = require("../respond");
var transaction = respond.transaction;


exports.configure = function (server) {
    /* === MOVIES === */

    var defaults = {
        query: { id: { $ne: null } },
        fields: models.ThinMovie.fields,
        options: {
            sort: {
                addedToDb: -1
            },
            skip: 0,
            limit: 50
        }
    };

    var isNullOrEmpty = obj => (!obj || !Object.keys(obj).length)

    server.get("/movies", function (req, res) {

        if (isNullOrEmpty(req.query)) {
            var params1 = [
                defaults.query,
                null,
                0,
                2000
            ];
            transaction("query", res, params1);

        } else {
            var mongoQuery = odataToMongo(req)
            var params2 = [mongoQuery, null];
            //res.send(params2);
            transaction("_find", res, params2);
        }

    });

    server.get("/movies/:id", (req, res) => transaction("getById", res, [req.params.id]));

    server.get("/movies/markaswatched/:id", function (req, res) {
        var id = parseInt(req.params.id, 10);
        respond.async(movieService.toggleWatched(id, true), res);
    });

    server.put("/movies/:id", function (req, res) {
        var update = req.body;
        update.id = parseInt(req.params.id, 10);
        transaction("update", res, [req.params.id], update);
    });

    server.del("/movies/:id", (req, res) =>transaction("remove", res, [req.params.id]))

    server.get("/movies/search/:query", (req, res) => transaction("searchMovies", res, [req.params.query, 2000]));

    server.post("/movies/query", function (req, res) {
        var query = JSON.parse(req.body);
        transaction("query", res, [query, null, 0, 2000]);
    });
}