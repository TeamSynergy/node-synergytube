var mongoose = require('mongoose');
var utils = require('../lib/utils');

var Schema = mongoose.Schema;

var MediaItemSchema = module.exports = new Schema({
  name: {
    type: String,
    default: 'Dummy Media Element'
  },
  media_id: {
    type: String,
    required: true
  },
  provider: {
    type: String,
    required: true
  },
  position: {
    type: Number,
    required: true
  },
  _user: {
    type: Number,
    ref: 'User',
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  start_time: {
    type: Date,
    default: new Date(0)
  }
});
