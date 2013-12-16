var config = require('../config');
var utils = require('../lib/utils');
var Channel = require('../models/Channel');
var xmbd = require('../lib/xmbd');
var async = require('async');
var getData = utils.getData;

exports.index = function(req, res){
  async.waterfall([
    function getChanneldata(fn){
      Channel
        .find()
        .sort('-visitors')
        .limit(15)
        .populate('_owner', '_id display_name')
        .lean()
        .exec(fn);
    },

    function populateThumbnail(channels, fn){
      async.each(channels, function(channel, next){
        channel.playlist.sort(utils.sortByStarttime);
        if(channel.playlist.length > 0){
          xmbd.getThumbnail(channel.playlist[0].provider, channel.playlist[0].media_id, function(err, thumb){
            channel.current_thumbnail = thumb;
            next(err);
          });
        } else {
          channel.current_thumbnail = '';
          next();
        }
      }, function(err){
        fn(err, channels)
      });
    }

  ], function onEnd(err, channels){
    var d = getData(req, err);
    d.channels = channels;
    res.render('index', d);
  });
};

exports.User = require('./User');
exports.Channel = require('./Channel');
