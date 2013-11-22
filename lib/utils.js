var crypto = require('crypto');

// Thanks to @davidwood (https://github.com/davidwood/node-password-hash)
var generateSalt = module.exports.generateSalt = function(len){
  return crypto.randomBytes(Math.ceil(len / 2)).toString('hex').substring(0, len);
};
