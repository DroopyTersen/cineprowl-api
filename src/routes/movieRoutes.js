// var odataToMongo = require("../odataToMongo");
var movieService = require("../movieService");
var models = require("cineprowl-models");
var respond = require("../respond");
var transaction = respond.transaction;
var queries = require("../queries");
var Fuse = require("fuse.js");

exports.configure = function (server) {
    /* === MOVIES === */


    server.get("/movies", function (req, res) {

        if (queries.isNullOrEmpty(req.query)) {
            var params1 = [
                queries.defaults.query,
                null,
                0,
                2000
            ];
            transaction("query", res, params1);

        } else {
            var mongoQuery = queries.odataToMongo(req)
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

    server.get("/movies/search/:query", (req, res) => {
        var odata = {
            $top: "2000"
        };
        odata = Object.assign({}, odata, req.query);
        var mongoQuery = queries.odataToMongo({ query: odata })
        //res.send(params2);
        movieService._find(mongoQuery, null).then(movies => {
            var opts = {
                shouldSort: true,
                threshold: 0.2,
                keys: [ "title" ]
            };
            var fuse = new Fuse(movies, opts);
            return fuse.search(req.params.query)
        })
        .then(movies => res.send(movies))
    });

    server.post("/movies/query", function (req, res) {
        var query = JSON.parse(req.body);
        transaction("query", res, [query, null, 0, 2000]);
    });
}