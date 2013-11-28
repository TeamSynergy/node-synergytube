var async = require('async');
var _ = require('underscore');
var utils = require('./utils');
var User = require('../models/User');
var Channel = require('../models/Channel');

var io;
module.exports = function(_io){
  io = _io;
  return sockethandler;
}

var sockethandler = function(socket){
  var thisChannel = function(fn){return Channel.findOne({ short_string: socket.channel_string })};
  socket.user = socket.handshake.user;
  socket.channel_string = socket.handshake.query.channel;

  socket.join(socket.channel_string);

  async.parallel({
    
    channel: function populateChannel(fn){
      thisChannel()
        .populate('messages._user', 'avatar.url')
        .exec(fn);
    },

    users: function populateUsers(fn){
      var userids = [];
      var c = io.sockets.clients(socket.channel_string);

      c = c.filter(function(el){
        if(!el.user.logged_in)  return false;
        if(!_.contains(userids, el.user._id)){
          userids.push(el.user._id);
          return true;
        } else {
          return false;
        }
      })
      .map(function(el){
        return {
          id: el.user._id,
          avatar: el.user.avatar.url,
          name: el.user.display_name
        }
      });

      fn(null, c);
    }

  }, function(err, results){
    if(err)  return socket.emit('err', err);
    socket.emit('channel.init', results);
  });

  socket.on('disconnect', function(){
    socket.leave(socket.channel_string);
    if(!socket.user.logged_in)
      socket.broadcast.to(socket.channel_string).emit('guest.leave');
    else if(!utils.socketAlreadyConnected(socket.channel_string, socket.user._id, io))
      socket.broadcast.to(socket.channel_string).emit('user.leave', { _id: socket.user._id });
  });


  socket.on('chat.send', function(data){
    thisChannel().exec(function(err, channel){
      channel.messages.push({ content: data.content, _user: socket.user._id });
      channel.save();
    });
  });
  socket.on('chat.more', function(data){});

  socket.on('playlist.push', function(data){});
  socket.on('playlist.move', function(data){});
  socket.on('playlist.play', function(data){});
  socket.on('playlist.next', function(data){});
  socket.on('playlist.delete', function(data){});
};


