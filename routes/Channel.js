var async = require('async');
var Channel = require('../models/Channel');
var config = require('../config');
var utils = require('../lib/utils');
var getData = utils.getData;

exports.Show = function(req, res){
  Channel.findOne({ short_string: req.params.channel_string }, function(err, channel){
    if(err)
      return res.render('index', getData(req, err));
    if(!channel)
      return res.render('index', getData(req, 'Channel not found'));

    var d = getData(req);
    d.channel = channel;

    res.render('Channel/Show', d);
  });
};

exports.Admin = function(req, res){

};

exports.Create = function(req, res){

};
