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

exports.CreateNew = function(req, res){
  async.waterfall([

    function validateReq(fn){
      if(!d.user.logged_in)  return fn('You\'re not logged in.');
      if(!req.form)  return fn('INOFORM');

      req.form.complete(fn);
    },

    function validateForm(fields, files, fn){
      var title = fields.title;
      var descr = fields.description;
      var url   = fields.url;

      if(!title || !descr || !url)  return fn('Invalid request.');
      if(fields.url.length < 4 || fields.url.length > 20 || fields.title.length > 20 ||
         fields.description.length > 800 || !/^[a-z0-9\-]*$/.test(fields.url) || fields.description.length < 40)
           return fn('Insufficent arguments.');
      if(url === 'create')  return fn('Reserved Keyword as URL.')

      fn(null, title, descr, url);
    },

    function channelExists(title, descr, url, fn){
      Channel.findOne({ short_string: url }, function(err, channel){
        if(err)  return fn(err);
        if(channel)  return fn('Another Channel with the same URL already exists.');

        fn(null, title, descr, url);
      });
    },

    function createChannel(title, descr, url, fn){
      Channel.create({
        name: title,
        short_string: url,
        description: _s.escapeHTML(descr),
        _owner: req.user._id
      }, fn);
    }
  ], function(err, channel){
    if(err === 'INOFORM')  return res.render('error', getData(req, 'Formidable not initialized correctly', true));
    if(err)  return res.render('Channel/Create', getData(req, err));
    res.redirect('/c/' + channel.short_string);
  });
}
