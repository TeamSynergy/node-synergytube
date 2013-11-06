var config = require('../config');
var xtend = require('xtend');

exports.index = function(req, res){
	var r = xtend(req.user, {
		logged_in: req.isAuthenticated()
	});
	res.render('index', r);
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