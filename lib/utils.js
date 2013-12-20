var passport = require('passport');
var config = require('../config');
var crypto = require('crypto');
var _s = require('underscore.string');
var fs = require('fs');

// Thanks to @davidwood (https://github.com/davidwood/node-password-hash)
exports.generateSalt = function(len){
  return crypto.randomBytes(Math.ceil(len / 2)).toString('hex').substring(0, len);
};

exports.generateUID = function(){
  var dict = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_';
  return 'xxxxxxxxxxx'.replace(/x/g, function(){ return dict[Math.random() * dict.length | 0] });
};

exports.getData = function(req, flash, error){
  var d = {
    user: req.user || {},
    ext: {
      show_facebook: !!config.passport.facebook,
      show_google: !!config.passport.google,
      show_local: !!config.passport.local
    }
  }
  d.user.logged_in = req.isAuthenticated();
  if(flash){
    var returnMessage = function(err){
      if(Array.isArray(err)){
        if(err.length === 1)  return returnMessage(err[0]);
        else  return err.map(returnMessage).join('\n');
      } else if(typeof err === 'object') {
        if(typeof err.message === 'string')  return err.message;
        else if(typeof err.message === 'object')  return returnMessage(err.message);
        else  return JSON.stringify(err);
      } else {
        return err;
      }
    };
    if(!error)  d.flash = returnMessage(flash);
    else        d.error = returnMessage(flash);
  }
  return d;
};

exports.normalizeMail = function(email){
  return email.replace('@googlemail.com', '@gmail.com').trim();
};

exports.socketAlreadyConnected = function(channel_string, user_id, io){
  var c = io.sockets.clients(channel_string);
  for (var i = c.length - 1; i >= 0; i--){
    if(c[i].user._id === user_id){
      return true;
    }
  }
  return false;
};

exports.getMD5 = function(val){
  return crypto.createHash('md5').update(val).digest('hex');
};

exports.deleteFile = function(path){
  fs.unlink(path, function(err){
    if(err)  console.log(err);
  });
};

exports.setAvatarHelper = function(user, provider, url, cb){
  user.avatar.provider = provider;
  user.avatar.url = url;
  user.save(cb);
};

exports.sortByStarttime = function(a, b){
  return b.start_time - a.start_time;
};

exports.sortByPosition = function(a, b){
  return a.position - b.position;
};

exports.passport = function(strategy){

  return function ppCb(req, res, next){
    var errcb = function(e,c){req.flash('error', e);res.redirect('/u/auth/fail')};
    passport.authenticate(strategy, function(err, user, info){
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
    })(req, res, next);
  }
}
