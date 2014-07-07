// Edit theses file to your desire and save it as config.js
module.exports = {
    server: {
        hostname: "localhost",
        port: 80,
        ip: '0.0.0.0',
        session_secret: "Your secret may be here!",
        // set to true if this node.js instance runs behind a reverse-proxy like nginx or varnish
        reverse_proxy: false,
    },
    mail: {
        service: "gmail",
        auth: {
            user: "blargh@gmail.com",
            pass: "password12345"
        }
    },
    passport: {
        // If you want to disable a login-option just set it's value to false
        // For facebook-login create an app at developers.facebook.com/apps
        facebook: {
            clientID: '444731456390652',
            clientSecret: '69909090438454205309227940091487'
        },
        google: true,
        local: true
    },
    // To enable Users uploading their own avatars register at http://avatars.io/
    // In the Email you'll probably receive there will be
    //  - a Public Token  = appID
    //  - a Private Token = accessToken
    // Thanks, Chute!
    avatars_io:{
        appID: "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJwcml2YXRlX3Rva2VuIjoiNjg4MGMwMjYwZTU0NzA4YTYxMGI2NzQ4ZWZiZmJhZDg1NGMwNWM1ZTFmZmIxNDFlNzRlYWIzYWQ1NjljMmNlOSJ9.dldkN0gVgBq4LuqWKdJo7mRAKo5uQZisGYt0mqM_V34",
        accessToken: "6880c0260e54708a610b6748efbfbad854c05c5e1ffb141e74eab3ad569c2ce9"
    },
    // For further reference see:
    // http://mongodb.github.io/node-mongodb-native/driver-articles/mongoclient.html#the-url-connection-format
    mongodb: "mongodb://<dbuser>:<dbpassword>@<dbhost>:<dbport>/<dbname>",
    redis: {
        // redis for session-caching.
        host: 'localhost',
        port: 6379
    },
    // this is the absolute URI-Path to thhe location
    // of your default avatar
    default_avatar: "/assets/img/avatar/default.png",
    // setting environment to anything else than dev disables logging, caching, ..
    environment: "dev",
    synergy: {
        force_sync: false,
        message_queue: 15
    }
}
