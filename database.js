var MongoClient = require('mongodb').MongoClient;
var config = require('./config');

module.exports.user = {};

module.exports.user.findOne = function(where, callback){
	getConnection('user', function(err, cl){
		if(err)
			return callback(err);

		cl.findOne(where, callback)
	});
};


function getConnection(collection, callback){
	MongoClient.connect(config.mongodb, function(err, db){
		if(err)
			return callback(err);
		db.createCollection(collection, function(err, collection){
			if(err)
				return callback(err);
			return callback(null, collection);
		});
	});
}