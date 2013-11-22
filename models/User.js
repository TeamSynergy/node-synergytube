var mongoose = require('mongoose');
var scrypt = require('js-scrypt');
var utils = require('../lib/utils');
var bufferEqual = require('buffer-equal');

var Schema = mongoose.Schema;

var UserSchema = new Schema({
  _id: {
    type: String,
    unique: true,
    default: utils.generateUID()
  },
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
  var self = this;

  scrypt.hash(pwd, salt, function(err, hash){
    if(err)  return cb(err);
    User.findByIdAndUpdate(self._id, { has_local: true, password_salt: salt, password_hash: hash }, cb);
  });
};

UserSchema.methods.verifyLocalPassword = function(pwd, cb){
  var salt = this.password_salt;
  var self = this;

  scrypt.hash(pwd, salt, function(err, hash){
    if(err)  return cb(err);
    cb(null, bufferEqual(self.password_hash, hash));
  });
}

var User = module.exports = mongoose.model('User', UserSchema);
