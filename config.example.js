// Edit theses file to your desire and save it as config.js

module.exports = {
	server: {
		hostname: "localhost",
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
		// create your own app here: https://developers.facebook.com/apps
		facebook: {
			// nope, these won't work
			clientID: '444731456390652',
			clientSecret: '69909090438454205309227940091487',
			// don't change this url, unless you know what you're doing
			callbackURL: 'http://localhost/u/auth/facebook/callback'
		}
	},
	// For further reference see: http://mongodb.github.io/node-mongodb-native/driver-articles/mongoclient.html#the-url-connection-format
	mongodb: "mongodb://<dbuser>:<dbpassword>@<dbhost>:<dbport>/<dbname>",
	// setting environment to anything else than dev disables logging, caching, directory-listings
	environment: "dev"
}