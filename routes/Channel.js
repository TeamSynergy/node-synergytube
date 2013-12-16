var async = require('async');
var _s = require('underscore.string');
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
    d.default_avatar = config.default_avatar;

    res.render('Channel/Show', d);
  });
};

exports.Admin = function(req, res){

};

exports.Create = function(req, res){
  var d = getData(req);

  if(d.user.logged_in){
    // how is this even called?
    // i don't know if this is the grammatically right way to do this...
    var name = d.user.display_name;
    name = (name[name.length - 1].toLowerCase() === 's' ? name + '\'' : name + '\'s');

    var slugs = [
      name + ' awesome kitten Channel!',
      'Raging at your display with ' + d.user.display_name + '!',
      name + ' proud collection of Internet-videos!',
      'Fluffy kitten-paradise at ' + name,
      'Free fluffy kitten Channel!',
      'Nopony is best pony!',
      'Wake up sheeple Channel!',
      d.user.display_name + ' and his amazing list of things.'
    ];

    d.slug = slugs[Math.floor(Math.random() * slugs.length)];
  }

  res.render('Channel/Create', d);
};
