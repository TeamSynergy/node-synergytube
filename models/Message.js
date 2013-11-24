var mongoose = require('mongoose');
var utils = require('../lib/utils');

var Schema = mongoose.Schema;

var MessageSchema = module.exports = new Schema({
  content: {
    type: String,
    required: true
  },
  _user: {
    type: String,
    required: true,
    ref: 'User'
  },
  timestamp: {
    type: Date,
    default: new Date()
  }
});
