var passport = require('passport');
var config = require('../config');
var crypto = require('crypto');
var _ = require('underscore');
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

/**
 * Check if the User with the given user_id is already connected to the channel
 * @param  {string} channel_string channel_string to check
 * @param  {string} user_id        mongodb-userid
 * @param  {Server} io             socket.io-server-object
 * @return {bool}                  True if the User is already connected with this channel (maybe another browser-tab or something)
 */
exports.socketAlreadyConnected = function(channel_string, user_id, io){
  return _.filter(io.sockets.connected, function(socket){
    return socket.user._id === user_id && _.contains(socket.rooms, channel_string);
  }).length > 0;
};

/**
 * Emits an event to all instances of the user with the given user_id in the given channel
 * @param  {string} channel_string 
 * @param  {string} user_id        
 * @param  {Server} io             socket.io-server-object
 * @param  {string} event          socket.emit(>event<, >message<);
 * @param  {object} message        
 */
exports.socketEmitToUser = function(channel_string, user_id, io, event, message){
  var connected = _.filter(io.sockets.connected, function(socket){
    return socket.user.logged_in && socket.user._id === user_id && _.contains(socket.rooms, channel_string);
  });

  _.each(connected, function(socket){
    socket.emit(event, message);
  });
};

/**
 * Returns all Clients connected to a given channel
 * @param  {string} channel_string 
 * @param  {Server} io             socket.io-server-object
 * @return {Array<Client>}         
 */
exports.socketChannelClients = function(channel_string, io){
  return _.filter(io.sockets.connected, function(socket){
    return _.contains(socket.rooms, channel_string);
  });
}

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