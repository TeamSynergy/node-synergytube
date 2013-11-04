var xtend = require('xtend');
var sessionStore;

module.exports = function createSessionStore(express){
	var c = require('./config');
	var mongoclient = require('mongodb').MongoClient;
	var yams = require('yams');

	sessionStore = new yams(function(callback){
		mongoclient.connect(c.mongodb, function(err, db){
			if(err)
				return callback(err);

			var sessionsCollection = db.collection('sessions');
			sessionsCollection.ensureIndex({expires:1}, {expiresAfterSeconds:0}, function(){});
			callback(null, sessionsCollection);
		});
	});

	var base = {
		key: 'synergy.sid',
		secret: c.server.session_secret,
		store: sessionStore
	};

	return {
		base: base,
		socket: xtend(base, {
			cookieParser: express.cookieParser
		})
	}
};