var crypto = require('crypto');

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
  }
  d.user.logged_in = req.isAuthenticated();
  if(flash && flash.length > 0)  d.flash = flash;
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
