var config = require('../config');
var utils = require('../lib/utils');
var getData = utils.getData;

exports.index = function(req, res){
  res.render('index', getData(req, req.flash('error')));
};

exports.User = require('./User');
