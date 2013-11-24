var config = require('../config');
var utils = require('../lib/utils');
var Channel = require('../models/Channel');
var getData = utils.getData;

exports.index = function(req, res){
  Channel
    .find()
    .populate('_owner')
    .limit(15)
    .sort('+visitors')
    .exec(function(err, channels){
      var data = getData(req, req.flash('error'));
      data.channels = channels;
      res.render('index', data);
    });
};

exports.User = require('./User');
exports.Channel = require('./Channel');
