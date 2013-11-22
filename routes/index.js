var config = require('../config');

exports.index = function(req, res){
  userify(req);
  res.render('index', req.user);
};

exports.authFail = function(req, res){
  res.render('index', { flash: req.flash('error') });
};

exports.authDestroy = function(req, res){
  req.logout();
  res.redirect('/');
};

exports.userCreate = function(req, res){
  res.render('userCreate');
}

exports.userShow = function(req, res){
  userify(req)
  if(req.params.userid === req.user._id.toString())
    res.render('userMe', req.user);
  else
    res.render('userProfile', req.user)
}

exports.userSet = function(req, res){

}

function userify(req){
  req.user = req.user || {};
  req.user.logged_in = req.isAuthenticated() || false;
}
