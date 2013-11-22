var xtend = require('xtend');
var sessionStore;

module.exports = function createSessionStore(express){
  var c = require('../config');

  if(c.redis){
    var RedisStore = require('connect-redis')(express);
    sessionStore = new RedisStore(c.redis);
  } else {
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
  }



  var base = {
    key: 'synergy.sid',
    secret: c.server.session_secret,
    store: sessionStore
  };

  return {
    base: base,
    socket: xtend(base, {
      cookieParser: express.cookieParser,
      fail: function(data, message, err, accept){
        if(err)
          console.log(message);
        accept(null, !err);
      }
    })
  }
};
