var async = require('async');
var Channel = require('../models/Channel');
var config = require('../config');
var utils = require('../lib/utils');
var getData = utils.getData;

exports.Show = function(req, res){
  var d = getData(req);
  res.render('Channel/Show', d);
};

exports.Admin = function(req, res){

};

exports.Create = function(req, res){

};
