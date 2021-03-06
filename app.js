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

var session = require('express-session');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');

var _s = require('underscore.string');
var xtend = require('xtend');
var utils = require('./lib/utils');
var form = require('./lib/connect-form');

var routes = require('./routes');
var config = require('./config');
var sessionstore = require('./lib/sessionstore')(session);
var sockethandler = require('./lib/sockethandler')(io);

var mongoose = require('mongoose');
var User = require('./models/User');
var Channel = require('./models/Channel');

mongoose.connect(config.mongodb, function(){
  console.log('Connected to MongoDB');
});

server.listen(config.server.port, config.server.ip, function(){
  console.log('Express server listening on ' + config.server.ip + ':' + config.server.port);
});

if(config.environment === 'dev'){
  app.use(require('morgan')('short'));
  io.set('log level', 2);
  app.set('view cache', false);
  swig.setDefaults({ cache: false });
}

app.engine('swig', swig.renderFile);
app.set('view engine', 'swig');

app.set('trust proxy', !!config.server.reverse_proxy);

if(!config.server.reverse_proxy){
  app.use(require('compression'));
}
app.use(methodOverride());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(flash());

io.set('authorization', passportsocket.authorize(sessionstore.socket));
app.use(cookieParser(config.server.session_secret));
app.use(session(sessionstore.base));
app.use(passport.initialize());
app.use(passport.session());

app.disable('x-powered-by');

passport.serializeUser(function(user, done){
  done(null, user);
});
passport.deserializeUser(function(creds, done){
  var email = (typeof creds === 'object' ? creds.email : creds);
  User.findOne({ email: email }).lean().exec(done);
});


var authUserByMail = function(mail, displayname, fbid, ggid, done){
  User.findAndUpdateIds(mail, fbid, ggid, function(err, user){
    if(err){
      return done(err);
    }
    if(!user){
      User.create({
        display_name: displayname,
        email: mail,
        'profiles.gravatar': utils.getMD5(mail),
        'profiles.facebook': fbid,
        'profiles.google': ggid
      }, function(err, user){
        console.log('created user');
        return done(null, user.email, { message: 'Successfuly created User' });
      });
    } else {
      return done(null, user.email);
    }
  });
};


if(config.passport.facebook){
  passport.use(new FacebookStrategy(xtend(config.passport.facebook, {
    callbackURL: 'http://' + config.server.hostname + '/u/auth/facebook/callback'
  }), function(accessToken, refreshToken, profile, done){
    authUserByMail(utils.normalizeMail(profile.emails[0].value), profile.displayName, profile.id, '', done);
  }));
  app.get('/u/auth/facebook', passport.authenticate('facebook', { scope: 'email' }));
  app.get('/u/auth/facebook/callback', utils.passport('facebook'));
}

if(config.passport.google){
  passport.use(new GoogleStrategy({
    realm: 'http://' + config.server.hostname,
    returnURL: 'http://' + config.server.hostname + '/u/auth/google/callback'
  }, function(identifier, profile, done){
    authUserByMail(utils.normalizeMail(profile.emails[0].value), profile.displayName, '', identifier, done);
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
}


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

app.use(express.static('./public'));

io.sockets.on('connection', sockethandler);
