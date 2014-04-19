var async = require('async');
var url = require('url');
var _s = require('underscore.string');
var avaio = require('avatars.io');
var moment = require('moment');
var User = require('../models/User');
var config = require('../config');
var utils = require('../lib/utils');
var getData = utils.getData;

avaio.appId = config.avatars_io.appID;
avaio.accessToken = config.avatars_io.accessToken;

exports.AuthFail = function(req, res){
  var f = req.flash('error');

  if(f && f.length > 0)
    res.render('error', getData(req, f, true));
  else
    res.redirect('back');
};

exports.DestroySession = function(req, res){
  req.logout();
  res.redirect('back');
};

exports.Show = function(req, res){
  var data = getData(req);

  User.findById(req.params.userid, '+profiles.facebook +profiles.google +profiles.gravatar', function(err, user){
    if(err)
      return res.render('index', getData(req, err));
    if(!user)
      return res.render('index', getData(req, 'User not found'));
    if(data.user.logged_in && req.params.userid === data.user._id){
      data.user = user;
      data.user.logged_in = true;
      data.user.avatar.default = config.default_avatar;
      return res.render('User/Me', data);
    } else {
      data.user = user;
      data.joindate = moment(data.user.register_date).fromNow(true)
      console.log(data.joindate);
      return res.render('User/Profile', data);
    }
  });
};

exports.RedirectMe = function(req, res){
  var d = getData(req);
  if(d.user.logged_in && d.user._id)
    res.redirect('/u/' + d.user._id);
  else
    res.redirect('/');
};

exports.Set = function(req, res){
  if(!req.form)  return res.redirect('/u/' + req.user._id);

  req.form.complete(function(err, fields, files){
    if(err)
      return res.redirect('index', getData(req, err));

    async.series([

      function setDisplayname(cb){
        if(fields.displayname){
          User.findByIdAndUpdate(req.user._id, { display_name: fields.displayname }, cb);
        }
        else
          cb();
      },

      function setPassword(cb){
        if(fields.password){
          if(fields.password.length <= 6)  return cb('The password must be longer than 6 chars.')
          User.findById(req.user._id, function(err, user){
            if(err)  return cb(err);
            user.setLocalPassword(fields.password, cb)
          });
        } else {
          cb();
        }
      },

      function setAvatar(cb){
        if(!fields.optAvatar)  return cb();


        User.findById(req.user._id, '+profiles.facebook +profiles.google +profiles.gravatar', function(err, user){
          if(err)  return cb(err);

          switch(fields.optAvatar){
            case 'facebook':
              utils.setAvatarHelper(user, 'facebook', '//graph.facebook.com/' + user.profiles.facebook + '/picture?width=256&height=256', cb);
              break;
            case 'twitter':
              if(!fields.twitteruser)  return cb('Please provide username.');
              utils.setAvatarHelper(user, 'twitter', '//avatars.io/twitter/' + fields.twitteruser + '?size=large', cb);
              break;
            case 'gravatar':
              utils.setAvatarHelper(user, 'gravatar', '//secure.gravatar.com/avatar/' + user.profiles.gravatar + '?s=256&d=identicon', cb);
              break;
            case 'upload':
              if(!files.avatar_image || files.avatar_image.size === 0)  return cb();
              if(files.avatar_image.size > 2 * 1024 * 1024)  return cb('The filesize is limited to 2mb!');
              var e = _s.endsWith.bind(this, files.avatar_image.name);
              if(!e('.gif') && !e('.png') && !e('.jpg') && !e('.jpeg')){
                return cb('Wrong filetype. Only gif, png and jpg are supported');
              }
              avaio.upload(files.avatar_image.path, user._id, function(err, url){
                if(err)  return cb(err);
                utils.setAvatarHelper(user, 'upload', url.replace('http://', '//') + '?size=large', cb);
              });
              break;
            default:
              utils.setAvatarHelper(user, 'default', config.default_avatar, cb);
              break;
          }
        });

      },

      function deleteTmpFile(cb){
        if(files.avatar_image)
          utils.deleteFile(files.avatar_image.path);
        cb();
      }

    ], function(err){
      if(err)
        res.render('/u/' + req.user._id, getData(req, err));
      else
        res.redirect('/u/' + req.user._id);
    });
  });
};

exports.Create = function(req, res){
  if(!req.isAuthenticated())
    res.render('User/Create', getData(req));
  else
    res.redirect('/')
};

exports.CreateNew = function(req, res){
  async.waterfall([

    function validate(fn){
      if(!req.body.displayname)  return fn('Please provide a displayname.');
      if(!req.body.email)  return fn('Please provide a valid email.')
      if(!req.body.password || req.body.password.length < 6)  return fn('Your password has to be at least 6 chars long.');

      User
        .findOne({ email: req.body.email })
        .exec(function(err, user){
          if(user)  return fn('User with the same email already exists.');
          else  return fn();
        });
    },
    
    function userCreate(fn){
      User.create({
        display_name: req.body.displayname,
        email: req.body.email,
        'profiles.gravatar': utils.getMD5(req.body.email)
      }, fn);
    },


    function setPwd(user, fn){
      user.setLocalPassword(req.body.password, fn);
    },


    function findLean(user, fn){
      User
        .findOne({ _id: user._id })
        .lean()
        .exec(fn);
    },

    function login(user, fn){
      req.login(user, fn);
    }
  ], function(err){
    if(err)  return res.render('User/Create', getData(req, err));

    res.redirect('/');
  });
};
