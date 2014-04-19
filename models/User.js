var mongoose = require('mongoose');
var config = require('../config');
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
  password_hash: {
    type: Buffer,
    select: false
  },
  password_salt: {
    type: String,
    select: false
  },
  register_date: {
    type: Date,
    default: Date.now
  },
  avatar: {
    url: {
      type: String,
      default: config.default_avatar
    },
    provider: {
      type: String,
      default: 'default'
    }
  },
  profiles: {
    facebook: {
      type: String,
      default: '',
      select: false
    },
    google: {
      type: String,
      default: '',
      select: false
    },
    gravatar: {
      type: String,
      default: '',
      select: false
    }
  },
  favourites: [{ _id: { type: Schema.Types.ObjectId, ref: 'Channel' }}]
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
};

UserSchema.static('findAndUpdateIds', function(email, fbid, ggid, fn){
  this.findOne({ email: email }, function(err, user){
    if(err)
      return fn(err);
    if(!user)
      return fn(null, user);

    var save = false;
    
    if(!user.profiles.facebook && fbid){
      save = true;
      user.profiles.facebook = fbid;
    }
    if(!user.profiles.google && ggid){
      save = true;
      user.profiles.google = ggid;
    }
    if(!user.profiles.gravatar && email){
      // When again should this happen?
      save = true;
      user.profiles.gravatar = utils.getMD5(email);
    }

    if(save){
      user.save(function(err, user){
        if(err)
          return fn(err);
        else
          return fn(null, user);
      });
    } else {
      return fn(null, user);
    }

  });
});

var User = module.exports = mongoose.model('User', UserSchema);
