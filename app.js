var passportsocket = require('passport.socketio');
var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;
var express = require('express');
var swig = require('swig');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server, { 'browser client minification': true });
var routes = require('./routes');
var config = require('./config');

server.listen(config.server.port, function(){
	console.log('Express server listening on port ' + config.server.port);
});

var sessionstore = require('./sessionstore')(express);
var sockethandler = require('./sockethandler');


app.set('env', config.environment == 'dev' ? 'dev' : 'production');
app.configure('dev', function(){
	app.use(express.errorHandler());
	app.use(express.logger('dev'));
	io.set('log level', 2);
	app.set('view cache', false);
	swig.setDefaults({ cache: false });
});

app.engine('swig', swig.renderFile);
app.set('views', './views');
app.set('view engine', 'swig');

app.use(express.compress());
app.use(express.methodOverride());
app.use(express.json());
app.use(express.urlencoded());
app.use(express.cookieParser(config.server.session_secret));
app.use(express.session(sessionstore.base));
app.use(passport.initialize());
app.use(passport.session());
app.use(app.router);
app.use(express.static('./public'));
if(app.get('env') === 'dev')
	app.use(express.directory('./public', { icons: true }));

app.disable('x-powered-by');

io.set('authorization', passportsocket.authorize(sessionstore.socket));


passport.serializeUser(function(user, done){
	done(null, user);
});
passport.deserializeUser(function(id, done){
	done(null, id);
})

passport.use(new FacebookStrategy(config.passport.facebook, function(accessToken, refreshToken, profile, done){
	//console.log(profile);
	done(null, profile.emails[0].value);
}));


app.get('/', routes.index);

app.get('/u/auth/facebook', passport.authenticate('facebook', { scope: 'email' }));
app.get('/u/auth/facebook/callback', passport.authenticate('facebook', {
	successRedirect: '/',
	failureRedirect: '/fail'
}))


/*app.get('/c/:channelname', routes.channel);
app.get('/c/:channelname/config', routes.channelConfig);
app.get('/c/create', routes.channelCreate);

app.get('/u/:username', routes.user);
app.get('/u/config', routes.userConfig);*/

io.sockets.on('connection', sockethandler)

function ensureAuthenticated(req, res, next){
	if(req.isAuthenticated())
		return next();
	res.redirect('/fail');
}