var passport = require('passport');
var passportsocket = require('passport.socketio');
var FacebookStrategy = require('passport-facebook').Strategy;
var GoogleStrategy = require('passport-google').Strategy;
var LocalStrategy = require('passport-local').Strategy;

var express = require('express');
var flash = require('connect-flash');
var swig = require('swig');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server, { 'browser client minification': true });

var passwordHash = require('password-hash');
var xtend = require('xtend');
var utils = require('./lib/utils');

var routes = require('./routes');
var config = require('./config');
var sessionstore = require('./lib/sessionstore')(express);
var sockethandler = require('./lib/sockethandler');

var mongoose = require('mongoose');
var User = require('./models/User');
var Channel = require('./models/Channel');

mongoose.connect(config.mongodb, function(){
  console.log('Connected to MongoDB');
});

server.listen(config.server.port, function(){
  console.log('Express server listening on port ' + config.server.port);
});


app.set('env', config.environment == 'dev' ? 'dev' : 'production');
app.configure('dev', function(){
  app.use(express.favicon());
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
app.use(flash());

io.set('authorization', passportsocket.authorize(sessionstore.socket));
app.use(express.cookieParser(config.server.session_secret));
app.use(express.session(sessionstore.base));
app.use(passport.initialize());
app.use(passport.session());

app.use(app.router);
app.use(express.static('./public'));

app.disable('x-powered-by');

passport.serializeUser(function(user, done){
  done(null, user);
});
passport.deserializeUser(function(creds, done){
  var email = (typeof creds === 'object' ? creds.email : creds);
  User.findOne({ email: email }, '-password_hash -password_salt', done);
});

var passportCallbackOptions = {
  successRedirect: '/',
  failureRedirect: '/u/auth/fail',
  failureFlash: true
};
var authUserByMail = function(mail, displayname, done){
  User.findOne({ email: mail }, function(err, user){
    if(err)
      return done(err);
    if(!user)
      User.create({ display_name: displayname, email: mail }, function(err, user){
        console.log('created user');
        return done(null, user.email, { message: 'Successfuly created User' });
      });
    else
      return done(null, user.email);
  });
};
if(config.passport.facebook){
  passport.use(new FacebookStrategy(xtend(config.passport.facebook, {
    callbackURL: config.server.hostname + '/u/auth/facebook/callback'
  }), function(accessToken, refreshToken, profile, done){
    authUserByMail(utils.normalizeMail(profile.emails[0].value), profile.displayName, done);
  }));
  app.get('/u/auth/facebook', passport.authenticate('facebook', { scope: 'email' }));
  app.get('/u/auth/facebook/callback', passport.authenticate('facebook', passportCallbackOptions));
}
if(config.passport.google){
  passport.use(new GoogleStrategy({
    realm: config.server.hostname,
    returnURL: config.server.hostname + '/u/auth/google/callback'
  }, function(identifier, profile, done){
    authUserByMail(utils.normalizeMail(profile.emails[0].value), profile.displayName, done);
  }));
  app.get('/u/auth/google', passport.authenticate('google'));
  app.get('/u/auth/google/callback', passport.authenticate('google', passportCallbackOptions));
}
if(config.passport.local){
  passport.use(new LocalStrategy({
    usernameField: 'email'
  }, function(email, password, done){
    User.findOne({ email: email }, function(err, user){
      if(err)
        return done(err);
      if(!user)
        return done(null, false, { message: 'User not found.' });
      if(!user.has_local)
        return done(null, false, { message: 'There is no password set for this User. Try loging in via the other available Options and set the password in the Usersettings.' });
      user.verifyLocalPassword(password, function(err, verified){
        if(err)
          return done(null, false, { message: 'There was an internal error: ' + err });
        if(!verified)
          return done(null, false, { message: 'Invalid password.' });
        else
          return done(null, user);
      });
    });
  }));
  app.post('/u/auth/local', passport.authenticate('local', passportCallbackOptions));
}


app.get('/', routes.index);

app.get('/u/auth/fail', routes.User.AuthFail);
app.get('/u/auth/logout', routes.User.DestroySession);
app.post('/u/set', routes.User.Set);
app.get('/u/create', routes.User.Create);
app.get('/u/:userid', routes.User.Show);

app.get('/c/:channel_string', routes.Channel.Show);
app.get('/c/:channel_string/admin', routes.Channel.Admin);
app.get('/c/create', routes.Channel.Create);

io.sockets.on('connection', sockethandler);
