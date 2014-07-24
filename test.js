// Server-Objects
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

// Middleware
var bodyParser = require('body-parser');
var expressCompress = require('compression');
var session = require('express-session');
var flash = require('connect-flash');

// 3rd-Party Libraries
var swig = require('swig');
var passport = require('passport');
var ioredis = require('socket.io-redis');
var iopassp = require('passport.socketio');
var form = require('./lib/connect-form');
var psphelper = require('./lib/passporthelper');
var putils = require('./lib/utils.passport');
var debug = require('debug')('st:server-main');

// node-synergytube Libraries
var routes = require('./routes');
var config = require('./config');
var sockethandler = require('./lib/sockethandler')(io);
var sessionstore = require('./lib/sessionstore')(session);

// Database-Stuff
var mongoose = require('mongoose');

// Debugging/Dev-Environment
if(config.environment === 'dev'){
  app.set('view cache', false);
  swig.setDefaults({ cache: false });
  app.use(require('morgan')('tiny'));
}

// Express-Configuration
app.set('trust proxy', !!config.server.reverse_proxy);
app.engine('swig', swig.renderFile);
app.set('view engine', 'swig');
app.disable('x-powered-by');

// socket.io-Configuration
io.adapter(ioredis(config.redis));
io.use(iopassp.authorize(sessionstore.socket));

// Passport-Configuration
passport.serializeUser(putils.passportSerialize);
passport.deserializeUser(putils.passportDeserialize);

// Middleware
app.use(expressCompress());
app.use(session(sessionstore.base));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());


// Express Routes
app.get('/', routes.index);
app.get('/err', routes.err);

app.get('/u/auth/fail', routes.User.AuthFail);
app.get('/u/auth/logout', routes.User.DestroySession);
app.post('/u/set', form({ keepExtensions: true }), routes.User.Set);
app.get('/u/set', routes.User.RedirectMe);
app.get('/u/create', routes.User.Create);
app.get('/u/me', routes.User.RedirectMe);
app.get('/u/:userid', routes.User.Show);

app.get('/c/create', routes.Channel.Create);
app.post('/c/create', form({ keepExtensions: true }), routes.Channel.CreateNew);
app.get('/c/:channel_string', routes.Channel.Show);
app.get('/c/:channel_string/admin', routes.Channel.Admin);

// Passport-Routes and Authentication
psphelper(config.passport, app);

/*if(config.passport.facebook){
  passport.use(new FacebookStrategy(xtend(config.passport.facebook, {
    callbackURL: 'http://' + config.server.hostname + '/u/auth/facebook/callback'
  }), function(accessToken, refreshToken, profile, done){
    utils.authUserByMail(utils.normalizeMail(profile.emails[0].value), profile.displayName, profile.id, '', done);
  }));
  app.get('/u/auth/facebook', passport.authenticate('facebook', { scope: 'email' }));
  app.get('/u/auth/facebook/callback', utils.passport('facebook'));
}

if(config.passport.google){
  passport.use(new GoogleStrategy({
    realm: 'http://' + config.server.hostname,
    returnURL: 'http://' + config.server.hostname + '/u/auth/google/callback'
  }, function(identifier, profile, done){
    utils.authUserByMail(utils.normalizeMail(profile.emails[0].value), profile.displayName, '', identifier, done);
  }));
  app.get('/u/auth/google', passport.authenticate('google'));
  app.get('/u/auth/google/callback', utils.passport('google'));
}

if(config.passport.local){
  passport.use(new LocalStrategy({
    usernameField: 'email'
  }, function(email, password, done){
    User.findOne({ email: email }, '+password_hash +password_salt', function(err, user){
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
  app.post('/u/auth/local', utils.passport('local'));
  app.post('/u/create', routes.User.CreateNew)
}*/


// Misc Middleware
app.use(express.static('./public'));


// Connections
server.listen(config.server.port, config.server.ip, function(){
  debug('http listening on: %s:%d', config.server.ip, config.server.port);
});

mongoose.connect(config.mongodb, function(){
  debug('mongodb connected');
});

io.sockets.on('connection', sockethandler);