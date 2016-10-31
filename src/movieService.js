var MovieService = require("cineprowl-services").MovieService;
var movieService = new MovieService("mongodb://brain:27017/cineprowl");
module.exports = movieService;