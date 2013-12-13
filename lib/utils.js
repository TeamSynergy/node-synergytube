var config = require('../config');
var crypto = require('crypto');
var fs = require('fs');

// Thanks to @davidwood (https://github.com/davidwood/node-password-hash)
exports.generateSalt = function(len){
  return crypto.randomBytes(Math.ceil(len / 2)).toString('hex').substring(0, len);
};

exports.generateUID = function(){
  var dict = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_';
  return 'xxxxxxxxxxx'.replace(/x/g, function(){ return dict[Math.random() * dict.length | 0] });
};

exports.getData = function(req, flash){
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
    if(typeof flash === 'object' && !Array.isArray(flash))
      d.flash = JSON.stringify(flash.message) || JSON.stringify(flash);
    else if(Array.isArray(flash))
      d.flash = flash.map(JSON.stringify).join('\r\n');
    else
      d.flash = flash;
  }
  return d;
};

exports.normalizeMail = function(email){
  return email.replace('@googlemail.com', '@gmail.com');
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
