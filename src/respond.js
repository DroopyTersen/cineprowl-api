var movieService = require("./movieService");

var transaction = exports.transaction =function (method, res, params) {
	return asyncResponse(movieService[method].apply(movieService, params), res);
};

var asyncResponse = exports.async = (promise, res) => {
    return promise
        .then(result => res.send(result))
        .catch(err => res.send(500, err))
};