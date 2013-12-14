var async = require('async');
var _ = require('underscore');
var xmbd = require('./xmbd');
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
  // this function always returns the current channel. as a promise of course
  var thisChannel = function(fn){return Channel.findOne({ short_string: socket.channel_string })};

  // make the user property faster accesible
  // also: prepolute owner & admin. those will receive their
  // right value when we init the client.
  socket.user = socket.handshake.user;
  socket.user.owner = false;
  socket.user.admin = false;
  socket.channel_string = socket.handshake.query.channel;

  // has the user already joined this channel in another client?
  // important for not displaying the same user more than once
  // (new tab, other browser, etc..)
  socket.alreadyJoined = utils.socketAlreadyConnected(socket.channel_string, socket.user._id, io);
  socket.join(socket.channel_string);

  async.parallel({
    
    // basic properties like playlist & chat
    channel: function populateChannel(fn){
      thisChannel()
        // be sure to also receive the avatars and displaynames in our messages
        .populate('messages._user', 'avatar.url display_name')
        .lean()
        .exec(function(err, channel){
          if(err)  return fn(err);

          // only send the latest (eg: 15) messages.
          channel.messages = channel.messages.sort(function(a, b){ return b.timestamp - a.timestamp })
                              .splice(0, config.synergy.message_queue);

          fn(null, channel);
        });
    },

    users: function populateUsers(fn){
      var userids = [];
      var c = io.sockets.clients(socket.channel_string);

      // filter: makes sure, we only receive logged_in-users. once.
      c = c.filter(function(el){
        if(!el.user.logged_in)  return false;
        if(!_.contains(userids, el.user._id)){
          userids.push(el.user._id);
          return true;
        } else {
          return false;
        }
      })

      // map: makes sure the client receives the user in a readable format
      // _id, avatar, name (displayname)
      .map(function(el){
        return {
          _id: el.user._id,
          avatar: el.user.avatar.url,
          name: el.user.display_name
        }
      });

      fn(null, c);
    },

    // guests is just a number.
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

    // populate owner & admin as mentioned above.
    socket.user.owner = results.channel._owner === socket.user._id;
    socket.user.admin = _.contains(results.channel._admins, socket.user._id);

    // add those properties to our results, so the client also receives them.
    results.me = {
      owner: socket.user.owner,
      admin: socket.user.admin
    }

    // inform all other clients, that a guest/user has joined
    if(!socket.user.logged_in){
      socket.broadcast.to(socket.channel_string).emit('guest.join');

    // be sure to not propagate the second-time-join of a user
    } else if(!socket.alreadyJoined) {
      socket.broadcast.to(socket.channel_string).emit('user.join', {
        _id: socket.user._id,
        avatar: socket.user.avatar.url,
        name: socket.user.display_name
      });
    }

    // is setting to `undefined` really necessary?
    socket.alreadyJoined = undefined;

    // emit the results.
    socket.emit('channel.init', results);
  });



  /**
   * inform our clients about the disconnection of users/guests
   *   guests just decrement the counter.
   */
  socket.on('disconnect', function(){
    socket.leave(socket.channel_string);
    if(!socket.user.logged_in)
      socket.broadcast.to(socket.channel_string).emit('guest.leave');

    // also, be sure to not send a leave, if the user has another session.
    else if(!utils.socketAlreadyConnected(socket.channel_string, socket.user._id, io))
      socket.broadcast.to(socket.channel_string).emit('user.leave', { _id: socket.user._id });
  });


  /**
   * Chat Related methods.
   */

  /**
   * we got a new message from a user!
   * @param  {object} usermessage An object containing the messagecontent.
   *   may hold metadata in the future
   */
  socket.on('chat.send', function(usermessage){
    if(!usermessage || !usermessage.content)  return socket.emit('err', 'invalid request');
    if(socket.user.logged_in)  return socket.emit('err', 'You have to login to use the Chat');

    // why `usermessage` not only a string with the content is?
    // an object is future-proof!

    thisChannel().exec(function(err, channel){
      if(err)  return socket.emit('err', err);

      // this is actually a huge object..
      var message = {
        _user: {
          _id: socket.user._id,
          display_name: socket.user.display_name,
          avatar: {
            url: socket.user.avatar.url
          }
        },
        content: usermessage.content
      };

      // even if the database-save fails, the clients still receive the message.
      // so: in case of a database-failure, people can still communicate
      io.sockets.in(socket.channel_string).emit('chat.send', message);

      // database stuff..
      channel.messages.push({ content: usermessage.content, _user: socket.user._id });
      channel.save(function(err){ if(err) socket.emit('err', err); });

    });
  });


  /**
   * a user scrolled up in the chatbox and now demands more messages!
   * @param  {object} userFirstMessage the users top/first message. containing the `_id` and some metadata.
   */
  socket.on('chat.more', function(userFirstMessage){
    if(!userFirstMessage || !userFirstMessage._id)  return socket.emit('err', 'invalid request');

    thisChannel()
      .select('messages')
      .populate('messages._user', 'avatar.url display_name')
      .lean()
      .exec(function(err, channel){
        if(err)  return socket.emit('err', err);

        // sort messages; so: first message is 0.
        channel.messages.sort(function(a, b){ return a.timestamp - b.timestamp });

        // this will be populated
        var messages = [];

        // channel.messages = [first_message_ever, second_message_ever];
        // now we take all of these messages until we reach the one,
        // where the user currently is.
        for (var i = 0; i < channel.messages.length; i++) {
          if(channel.messages[i]._id.equals(userFirstMessage._id))  break;

          // add this message to our very own array
          messages.push(channel.messages[i]);
        };

        // reverse the array, so the `first_message_ever` is the last item
        // in our `message` array.
        messages.reverse();

        // now we just take the ammount of messages we are allowed
        // to send to the client.
        // defined by `config.synergy.message_queue`
        messages = messages.splice(0, config.synergy.message_queue);

        console.log('more messages:', messages.length);

        // to the moooon!
        socket.emit('chat.more', messages);
      });
  });



  /**
   * Playlist Related methods
   */

  /**
   * an admin wants to add a new item!
   * @param  {object} useritem an object containing the media_provider and the media_id of the item to add.
   */
  socket.on('playlist.push', function(useritem){
    if(!socket.user.owner && !socket.user.admin)  return socket.emit('err', 'You\'re not an Admin nor the Owner of this Channel');
    if(!useritem || !useritem.provider || !useritem.id)  return socket.emit('err', 'invalid request');

    thisChannel()
      .select('playlist')
      .exec(function(err, channel){
        if(err)  return socket.emit('err, err');

        // to calc the new position we just take the
        // highest position in the array and add 1.
        var newPos = _.max(channel.playlist.toObject(), function(i){ return i.position; }).position + 1;

        // use xmbd to receive the info the user just sent us.
        // Yep, just because we can't trust them.
        xmbd.getInfo(useritem.provider, useritem.id, function(err, info){
          console.log('add new item:', info.name);

          // if the user sent the item properly we wouldn't need this.
          if(err)  return socket.emit('err', err);
          if(!info.available)  return socket.emit('err', 'Mediaitem not available');

          // use `channel.playlist.create()` to create a playlist-item
          // this won't be saved in our database on `save()`
          // but we need it in order to obtain the _id.
          // the user has no idea what to do with a item without _id.
          var item = channel.playlist.create({
            _user: socket.user._id,
            duration: info.duration,
            media_id: info.id,
            name: info.name,
            position: newPos,
            provider: info.provider
          });


          // actual work.
          channel.playlist.push(item);
          
          // database-saving stuff and propagating
          channel.save(function(err){
            if(err)  return socket.emit('err', err);

            // even the user who sent the add-request receives the item here.
            // allowing the user to add the item before we added it to the
            // database would cause more trouble than a lost message!
            io.sockets.in(socket.channel_string).emit('playlist.push', item);
          });
        });
      });
  });

  
  /**
   * an admin wants to move one item in the playlist (or more)
   * @param  {array} userplaylist an array which holds the users playlist
   */
  socket.on('playlist.move', function(userplaylist){
    if(!socket.user.owner && !socket.user.admin)  return socket.emit('err', 'You\'re not an Admin nor the Owner of this Channel');
    if(!userplaylist || !_.isArray(userplaylist))  return socket.emit('err', 'invalid request');

    console.log('playlist move');

    // this is the var which will hold the final playlist
    // we need it for error-cases.
    var endPlaylist;

    async.waterfall([

      function receiveChannel(fn){
        thisChannel()
          .select('playlist')
          .exec(fn);
      },

      // align our servers playlist to the users playlist
      function align(channel, fn){
        // bool, indicating whether all items in the
        // users playlist have been found.
        var allFound = true;

        // iterate over our servers playlist
        channel.playlist.forEach(function(item){
          // receive the item with the same _id out of the users playlist.
          var fromUser = _.findWhere(userplaylist, { _id: item._id.toString() });

          // set our endPlaylist in case of errors
          endPlaylist = channel.playlist.toObject().map(function(i){ return { _id: i._id, position: i.position }; });

          if(fromUser){
            // set the new position
            item.position = fromUser.position;
          } else {
            // if we have no copy of the users item,
            // we can be sure that his playlist is corrupted
            // so: don't save, reset the user, break this loop.
            allFound = false;

            // 404 - item is missing ;)
            return fn('Some item was not found in the servers playlist');
          }
        });

        // set the final playlist
        endPlaylist = channel.playlist.toObject().map(function(i){ return { _id: i._id, position: i.position }; });

        return fn(null, channel);
      },

      function allFound(channel, fn){
        channel.save(fn);
      }

    ], function final(err, channel){
      var playlist = channel ? channel.playlist.toObject().map(function(i){ return { _id: i._id, position: i.position }; }) : null;

      if(err){
        console.log(err);

        // reset our client
        if(channel){
          socket.emit('playlist.move', playlist);
        } else {
          socket.emit('playlist.move', endPlaylist);
        }
        
        // and send him the error.
        return socket.emit('err', err);

      } else {

        // send the new playlist to all the users, except the one we've got it from
        socket.broadcast.to(socket.channel_string).emit('playlist.move', playlist);
      }
    });
  });


  /**
   * an admin enforces an item-play
   * @param  {object} useritem contains the `_id` of the new item and some metadata
   */
  socket.on('playlist.play', function(useritem){
    if(!socket.user.owner && !socket.user.admin)  return socket.emit('err', 'You\'re not an Admin nor the Owner of this Channel');
    if(!useritem || !useritem._id)  return socket.emit('err', 'invalid request');
    thisChannel()
      .select('playlist')
      .exec(function(err, channel){
        if(err)  return socket.emit('err', err);

        console.log('force-play', useritem.name, 'from', socket.user.display_name || 'Anonymous');

        // find the servers item with a matchin `_id`
        var item;
        for (var i = 0; i < channel.playlist.length; i++) {
          if(channel.playlist[i]._id.equals(useritem._id)){
            item = channel.playlist[i];
          }
        };

        // if we didn't find that item:
        // send the user back and emit the error
        if(!item){
          socket.emit('playlist.play', channel.playlist.sort(utils.sortByStarttime)[0]);
          return socket.emit('err', 'Invalid Item (item not found in the database)');
        }

        // be sure to set the starttime (set it as the current item)
        item.start_time = Date.now();

        channel.save(function(err){
          if(err)  return socket.emit('err', err);

          // inform all the clients!
          socket.broadcast.to(socket.channel_string).emit('playlist.play', item);
        });
      });
  });


  /**
   * any user, loggedin or not sends a message to the user signaling
   *   the start of the next item
   * @param  {object} usernext the users next item. will be compared to the servers next.
   */
  socket.on('playlist.next', function(usernext){
    if(!usernext || !usernext._id)  return socket.emit('err', 'invalid request');
    thisChannel()
      .select('playlist')
      .exec(function(err, channel){
        if(err)  return socket.emit('err', err);
        console.log('item-next-claim from', socket.user.display_name || 'Anonymous');


        // TODO: handle cueTo is negative.
        // for more info about that, see synergy.utils.js#utXmbd

        // receive our current and next item
        var current = channel.getCurrent();
        var next = channel.getNext(current);

        // calculate if the current item is still playing
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
          channel.save(function(err){ if(err) socket.emit('err', err);
           });
          console.log('-----------------\n');
        }
      });
  });


  /**
   * an admin deletes an item from the playlist
   * @param  {object} useritem An object containing the `_id` of the item to delete
   *   and some metadata (not needed).
   */
  socket.on('playlist.delete', function(useritem){
    if(!socket.user.owner && !socket.user.admin)  return socket.emit('err', 'You\'re not an Admin nor the Owner of this Channel');
    if(!useritem || !useritem._id)  return socket.emit('err', 'invalid request');

    thisChannel()
      .select('playlist')
      .exec(function(err, channel){
        if(err)  return socket.emit('err', err);

        var found = false;
        // that game again. we need those to determine
        // if the user is about to the delete the current item.
        var current = channel.getCurrent();
        var next = channel.getNext(current);

        // find the item to delete and delete it.
        for (var i = 0; i < channel.playlist.length; i++) {
          if(channel.playlist[i]._id.equals(useritem._id)){
            found = channel.playlist.toObject()[i];
            console.log('remove item:', useritem._id);
            channel.playlist.splice(i, 1);
          }
        };

        // if we have found the item to delete
        if(found){

          async.series([

            // save the deletion
            function saveSplice(fn){
              channel.save(fn);
            },

            // if we removed the current item, play the next one
            function nextOnCurrent(fn){
              if(!current._id.equals(found._id))  return fn();

              console.log('removing current item');
              next.start_time = Date.now();
              io.sockets.in(socket.channel_string).emit('playlist.play', next);

              channel.save(fn);
            },

            // align the playlist according to the index of the items
            function alignPlaylist(fn){
              channel.alignPlaylist(fn);
            }

          // throw err
          ], function final(err){
            if(err)  return socket.emit('err', err);
            io.sockets.in(socket.channel_string).emit('playlist.delete', useritem);
          });

        } else {
          // erm.. is there a reason to do anythin here?
          console.log('item to remove not found');
        }

      });
  });
  
  /**
   * sends the full playlist to the user.
   */
  socket.on('playlist.get', function(){
    thisChannel()
      .select('playlist')
      .exec(function(err, channel){
        if(err)  return socket.emit('err', err);
        socket.emit('playlist.get', channel.playlist);
      });
  });
};


