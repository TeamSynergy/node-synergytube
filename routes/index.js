exports.index = function(req, res){
	console.log('express-user:', req.user);
	res.render('index', { logged_in: req.isAuthenticated() });
};