var xtend = require('xtend');
var cookieParser = require('cookie-parser');
var sessionStore;

module.exports = function createSessionStore(session){
  var c = require('../config');
  var RedisStore = require('connect-redis')(session);

  sessionStore = new RedisStore(c.redis);

  var base = {
    key: 'synergy.sid',
    secret: c.server.session_secret,
    store: sessionStore,
    resave: true,
    saveUninitialized: true
  };

  return {
    base: base,
    socket: xtend(base, {
      cookieParser: cookieParser,
      fail: function(data, message, critical, next){
        if(critical)  throw new Error(message);
        return next();
      }
    })
  }
};
