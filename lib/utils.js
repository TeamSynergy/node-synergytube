var crypto = require('crypto');

// Thanks to @davidwood (https://github.com/davidwood/node-password-hash)
var generateSalt = module.exports.generateSalt = function(len){
  return crypto.randomBytes(Math.ceil(len / 2)).toString('hex').substring(0, len);
};

var generateUID = module.exports.generateUID = function(){
  var dict = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_';
  return 'xxxxxxxxxxx'.replace(/x/g, function(){ return dict[Math.random() * dict.length | 0] });
}

var getData = module.exports.getData = function(req, flash){
  var d = {
    user: req.user || {},
  }
  d.user.logged_in = req.isAuthenticated();
  if(flash)  d.flash = flash;
  return d;
}
