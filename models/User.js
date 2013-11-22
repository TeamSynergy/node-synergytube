var mongoose = require('mongoose');
var scrypt = require('js-scrypt');
var utils = require('../lib/utils');

var Schema = mongoose.Schema;

var UserSchema = new Schema({
  display_name: {
    type: String,
    default: ''
  },
  email: {
    type: String,
    index: true,
    required: true,
    lowercase: true,
    unique: true
  },
  has_local: {
    type: Boolean,
    default: false
  },
  password_hash: Buffer,
  password_salt: String,
  register_date: {
    type: Date,
    default: new Date()
  }
});

UserSchema.methods.setLocalPassword = function(pwd, cb){
  var salt = utils.generateSalt(10);

  scrypt.hash(pwd, salt, function(err, hash){
    if(err)  return cb(err);
    this.has_local = true;
    this.password_salt = salt;
    this.password_hash = hash;
    return cb(null, hash);
  });
};

var User = module.exports = UserSchema; //mongoose.model('User', UserSchema);
