var config = require('../config');
var utils = require('../lib/utils');
var getData = utils.getData;

exports.index = function(req, res){
  res.render('index', getData(req));
};

exports.User = require('./User');
