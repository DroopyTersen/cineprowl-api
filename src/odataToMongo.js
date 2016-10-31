var breezeMongo = require("breeze-mongodb");

var odataToMongo = function (req) {
	var mongoQuery = new breezeMongo.MongoQuery(req.query);
	return {
		query: isNullOrEmpty(mongoQuery.filter) ? defaults.query : mongoQuery.filter,
		fields: isNullOrEmpty(mongoQuery.select) ? defaults.fields : mongoQuery.select,
		options: isNullOrEmpty(mongoQuery.options) ? defaults.options : mongoQuery.options
	};
};

module.exports = odataToMongo;