var async = require('async');
var utils = require('./utils');
var User = require('../models/User');
var Channel = require('../models/Channel');

var io;
module.exports = function(_io){
  io = _io;
  return sockethandler;
}

var sockethandler = function(socket){
  socket.user = socket.handshake.user;
  socket.channel_string = socket.handshake.query.channel;

  socket.join(socket.channel_string);

  Channel.findOne({ short_string: socket.channel_string }, function(err, channel){
    socket.emit('channel.init', channel);
  });

  socket.on('disconnect', function(){
    socket.leave(socket.channel_string);
    if(!socket.user.logged_in)
      socket.broadcast.to(socket.channel_string).emit('guest.leave');
    else if(!utils.socketAlreadyConnected(socket.channel_string, socket.user._id, io))
      socket.broadcast.to(socket.channel_string).emit('user.leave', { _id: socket.user._id });
  });


  socket.on('chat.send', function(data){
    Channel.findOne({ short_string: socket.channel_string }, function(err, channel){
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


