var async = require('async');
var _ = require('underscore');
var utils = require('./utils');
var config = require('../config');
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
  socket.user.owner = false;
  socket.user.admin = false;
  socket.channel_string = socket.handshake.query.channel;

  socket.alreadyJoined = utils.socketAlreadyConnected(socket.channel_string, socket.user._id, io);
  socket.join(socket.channel_string);

  async.parallel({
    
    channel: function populateChannel(fn){
      thisChannel()
        .populate('messages._user', 'avatar.url display_name')
        .lean()
        .exec(function(err, channel){
          if(err)  return fn(err);
          fn(null, channel);
        });
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
          _id: el.user._id,
          avatar: el.user.avatar.url,
          name: el.user.display_name
        }
      });

      fn(null, c);
    },

    guests: function countGuests(fn){
      // retrieve all users connected to the channel
      var c = io.sockets.clients(socket.channel_string);
      // select all not-logged-in users
      var w = _.filter(c, function(s){ return !s.user.logged_in });
      // to the mooooon!
      return fn(null, w.length);
    }

  }, function(err, results){
    if(err)  return socket.emit('err', err);

    socket.user.owner = results.channel._owner === socket.user._id;
    socket.user.admin = _.contains(results.channel._admins, socket.user._id);

    results.me = {
      owner: socket.user.owner,
      admin: socket.user.admin
    }

    if(!socket.user.logged_in)
      socket.broadcast.to(socket.channel_string).emit('guest.join');
    else if(!socket.alreadyJoined)
      socket.broadcast.to(socket.channel_string).emit('user.join', {
        _id: socket.user._id,
        avatar: socket.user.avatar.url,
        name: socket.user.display_name
      });

    socket.alreadyJoined = undefined;
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
      if(err)  return socket.emit('err', err);
      io.sockets.in(socket.channel_string).emit('chat.send', {
        _user: {
          _id: socket.user._id,
          display_name: socket.user.display_name,
          avatar: {
            url: socket.user.avatar.url
          }
        },
        timestamp: new Date(),
        content: data.content
      });
      channel.messages.push({ content: data.content, _user: socket.user._id });
      channel.save();
    });
  });
  socket.on('chat.more', function(data){});

  socket.on('playlist.push', function(data){});
  socket.on('playlist.move', function(data){});


  socket.on('playlist.play', function(useritem){
    if(!socket.user.owner && !socket.user.admin)  return socket.emit('err', 'You\'re not an Admin nor the Owner of this Channel');
    thisChannel()
      .select('playlist')
      .exec(function(err, channel){
        if(err)  return socket.emit('err', err);

        console.log('force-play', useritem.name, 'from', socket.user.display_name || 'Anonymous');

        var item;

        for (var i = 0; i < channel.playlist.length; i++) {
          if(channel.playlist[i]._id.equals(useritem._id))
            item = channel.playlist[i];
        };

        if(!item)  return socket.emit('err', 'Invalid Item (item not found in the database)');

        item.start_time = Date.now();

        channel.save(function(err){
          if(err)  return socket.emit('err', err);

          socket.broadcast.to(socket.channel_string).emit('playlist.play', item);
        });
      });
  });


  socket.on('playlist.next', function(usernext){
    thisChannel()
      .select('playlist')
      .exec(function(err, channel){
        if(err)  return socket.emit('err', err);
        console.log('item-next-claim from', socket.user.display_name || 'Anonymous', ':');


        // TODO: handle cueTo is negative.
        // for more info about that, see synergy.utils.js#utXmbd

        var current = channel.playlist.sort(utils.sortByStarttime)[0];
        var byPos = channel.playlist.sort(utils.sortByPosition);

        var next = byPos[current.position] ? byPos[current.position] : byPos[0];

        var cueTo = (Date.now() - new Date(current.start_time).getTime()) / 1000;
        var isPlaying = cueTo < current.duration;


        if(isPlaying){
          // granted to always play the current on the client!
          console.log('send him back');
          return socket.emit('playlist.play', current);
        } else {
          // Item is not playing,
          // find & play the next

          // be sure to always change the date first!1!one!
          next.start_time = Date.now();

          console.log('change server-current to:', next.name);

          if(!next._id.equals(usernext._id) && !config.synergy.force_sync){
            console.log('user\'s next is not the server\'s next item. synced');
            socket.emit('playlist.play', next);
          }

          if(config.synergy.force_sync){
            console.log('force all users to sync to the newest item');
            socket.broadcast.to(socket.channel_string).emit('playlist.play', next);
          }

          // save the newest item to the database.
          // we don't mark the date as modified, because we
          // don't use internal functions.
          channel.save(function(err){
            if(err)  return socket.emit('err', err);
          });
          console.log('-----------------\n');
        }
      });
  });


  socket.on('playlist.delete', function(data){});
};


