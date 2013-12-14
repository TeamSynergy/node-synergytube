var mongoose = require('mongoose');
var utils = require('../lib/utils');

var MediaItemSchema = require('./MediaItem');
var MessageSchema = require('./Message');

var Schema = mongoose.Schema;

var ChannelSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  short_string: {
    type: String,
    required: true,
    index: true
  },
  description: {
    type: String,
    default: 'New Channel!'
  },
  _owner: {
    type: String,
    required: true,
    ref: 'User'
  },
  _admins: [{
    type: String,
    ref: 'User'
  }],
  visitors: {
    type: Number,
    default: 0
  },
  playlist: [MediaItemSchema],
  messages: [MessageSchema]
});

ChannelSchema.methods.alignPlaylist = function(fn){
  var playlist = this.playlist.sort(utils.sortByPosition);
  var cur = 1;
  playlist.forEach(function(item){
    item.position = cur;
    cur = cur + 1;
  });
  this.save(fn);
};

ChannelSchema.methods.getCurrent = function(){
  return this.playlist.sort(utils.sortByStarttime)[0];
};

ChannelSchema.methods.getNext = function(current){
  current = current || this.getCurrent();
  var byPos = this.playlist.sort(utils.sortByPosition);
  return byPos[current.position] ? byPos[current.position] : byPos[0];
};

var Channel = module.exports = mongoose.model('Channel', ChannelSchema);
