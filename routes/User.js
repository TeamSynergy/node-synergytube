var async = require('async');
var User = require('../models/User');
var config = require('../config');
var utils = require('../lib/utils');
var getData = utils.getData;

exports.AuthFail = function(req, res){
  res.render('index', getData(req, req.flash('error')));
};

exports.DestroySession = function(req, res){
  req.logout();
  res.redirect('back');
};

exports.Create = function(req, res){
  if(!req.isAuthenticated())
    res.render('User/Create');
  else
    res.redirect('/')
}

exports.Show = function(req, res){
  var data = getData(req);

  User.findById(req.params.userid, function(err, user){
    if(err)
      return res.render('index', getData(req, err));
    if(!user)
      return res.render('index', getData(req, 'User not found'));
    if(data.user.logged_in && req.params.userid === data.user._id)
      return res.render('User/Me', data);
    else
      return res.render('User/Profile', user);
  });
}

exports.Set = function(req, res){
  async.series([
    function setDisplayname(cb){
      if(req.body.displayname)
        User.findByIdAndUpdate(req.user._id, { display_name: req.body.displayname }, cb);
      else
        cb();
    },
    function setPassword(cb){
      if(req.body.password)
        User.findById(req.user._id, function(err, user){
          user.setLocalPassword(req.body.password, cb)
        });
      else
        cb();
    }
  ], function(err){
    if(err)
      res.render('index', getData(req, err));
    else
      res.redirect('/u/' + req.user._id);
  });
}
