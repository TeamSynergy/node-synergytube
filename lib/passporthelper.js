// Passport modules
var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;
var GoogleStrategy = require('passport-google-plus');
var LocalStrategy = require('passport-local').Strategy;

// Database stuff

// 3rd Party modules
var _ = require('underscore');
var _s = require('underscore.string');
var debug = require('debug')('st:passport-helper');
var xtend = require('xtend');
var utils = require('./utils');
var putils = require('./utils.passport');

var config = require('../config');


var strategies = {};

var protocol = config.server.ssl ? 'https://' : 'http://';

module.exports = function(passportConfig, app){
  debug('attached');

  _.each(passportConfig, function(strategyConfig, strategy){
    strategy = strategy.toLowerCase();

    // Throw Error if no matching Strategy is available
    if(!strategies.hasOwnProperty(strategy))  throw new Error('Strategy ' + strategy + ' not available');

    // Only add Strategy if config-value is truthy
    if(strategyConfig){
      debug('attaching strategy: %s', strategy);

      strategies[strategy](strategyConfig, app);
    }
  });
};



strategies.facebook = function(fbconfig, app){
  var facebookToAuth = function(accessToken, refreshToken, profile, done){
    var mail = utils.normalizeMail(profile.emails[0].value);
    var displayname = profile.displayName;
    var fbid = profile.id

    putils.authUserByMail(mail, displayname, fbid, '', done);
  };

  fbconfig.callbackURL = protocol + config.server.hostname + '/u/auth/facebook/callback';
  fbconfig.enableProof = true;

  passport.use(new FacebookStrategy(fbconfig, facebookToAuth));
  app.get('/u/auth/facebook', passport.authenticate('facebook', { scope: 'email' }));
  app.get('/u/auth/facebook/callback', putils.passportAuthenticator('facebook'));
};


strategies.google = function(gglconfig, app){
  var googleToAuth = function(tokens, profile, done){
    var mail = utils.normalizeMail(profile.email);
    var displayname = profile.displayName;
    var ggid = profile.id;

    putils.authUserByMail(mail, displayname, '', ggid, done);
  };


  passport.use(new GoogleStrategy(gglconfig, googleToAuth));
  app.post('/u/auth/google/callback', passport.authenticate('google'), function(req, res){res.send(req.user);});
};

strategies.local = function(lclconfig, app){

};
