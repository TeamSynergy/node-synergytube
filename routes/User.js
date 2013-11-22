var User = require('../models/User');
var config = require('../config');
var utils = require('../lib/utils');
var getData = utils.getData;

exports.AuthFail = function(req, res){
  res.render('index', getData(req, req.flash('error')));
};

exports.DestroySession = function(req, res){
  req.logout();
  res.redirect('/');
};

exports.Create = function(req, res){
  res.render('userCreate');
}

exports.Show = function(req, res){
  var data = getData(req);
  if(data.user.logged_in && req.params.userid === data.user._id.toString())
    res.render('userMe', data);
  else
    res.render('userProfile', data)
}

exports.Set = function(req, res){
  var data = getData(req, 'Sucessfully set some things!');

  if(req.body.displayname){
    User.findByIdAndUpdate(data.user._id, { display_name: req.body.displayname }, console.log);
  }
  if(req.body.password){
    User.findById(data.user._id, function(err, user){
      user.setLocalPassword(req.body.password, console.log)
    });
  }

  res.redirect('/u/' + data.user._id.toString());
}
