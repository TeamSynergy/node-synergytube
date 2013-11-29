// Edit theses file to your desire and save it as config.js
module.exports = {
	server: {
		hostname: "http://localhost",
		port: 80,
		session_secret: "Your secret may be here!"
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
	// For further reference see:
	// http://mongodb.github.io/node-mongodb-native/driver-articles/mongoclient.html#the-url-connection-format
	mongodb: "mongodb://<dbuser>:<dbpassword>@<dbhost>:<dbport>/<dbname>",
	redis: {
		// redis for session-caching. If you don't want/have redis
		// just set 'redis' to false or delete it and we'll fall back
		// to mongodb for sessio-storing. (slow)
		host: 'localhost',
		port: 6379
	},
	// setting environment to anything else than dev disables logging, caching, ..
	environment: "dev",
	synergy: {
		force_sync: false
	}
}
