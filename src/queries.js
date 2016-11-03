var breezeMongo = require("breeze-mongodb");
var models = require("cineprowl-models");

var isNullOrEmpty = exports.isNullOrEmpty = obj => (!obj || !Object.keys(obj).length)

var defaults = exports.defaults = {
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
    
var odataToMongo = exports.odataToMongo = function (req) {
	var mongoQuery = new breezeMongo.MongoQuery(req.query);
	return {
		query: isNullOrEmpty(mongoQuery.filter) ? defaults.query : mongoQuery.filter,
		fields: isNullOrEmpty(mongoQuery.select) ? defaults.fields : mongoQuery.select,
		options: isNullOrEmpty(mongoQuery.options) ? defaults.options : mongoQuery.options
	};
};
