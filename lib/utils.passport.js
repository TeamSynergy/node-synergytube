// Passport modules
var passport = require('passport');

// Database modules
var User = require('../models/User');

// 3rd Party modules
var debug = require('debug')('st:utils.passport');
var _s = require('underscore.string');


module.exports.authUserByMail = function(mail, displayname, fbid, ggid, done){
  User.findAndUpdateIds(mail, fbid, ggid, function(err, user){
    if(err)  return done(err);
    
    if(!user){
      User.create({
        display_name: displayname,
        email: mail,
        'profiles.gravatar': utils.getMD5(mail),
        'profiles.facebook': fbid,
        'profiles.google': ggid
      }, function(err, user){
        debug('Created user');
        return done(null, user.email, { message: 'Successfuly created User' });
      });
    } else {
      return done(null, user.email);
    }
  });
};

module.exports.passportAuthenticator = function(strategy){

  return function ppCb(req, res, next){
    var errcb = function(err){
      debug('Error while authenticating user: %o', err);
      req.flash('error', err);
      res.redirect('/u/auth/fail')
    };

    var customAuthenticator = passport.authenticate(strategy, function(err, user, info){
      if(err || !user)  return errcb(err || info);

      req.logIn(user, function(err){
        if(err)  return errcb(err);

        var ref = req.header('Referer');
        if(_s.include(ref, '/u/auth/fail')){
          res.redirect('/');
        } else {
          res.redirect('back');
        }
      });
    });

    customAuthenticator(req, res, next);
  }
};

module.exports.passportSerialize = function(user, done){
  done(null, user);
};

module.exports.passportDeserialize = function(creds, done){
  var email = (typeof creds === 'object' ? creds.email : creds);
  User.findOne({ email: email }).lean().exec(done);
};