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

var Channel = module.exports = mongoose.model('Channel', ChannelSchema);
