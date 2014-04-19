# SynergyTube
> SynergyTube aims to provide an alternative to the now shut-down SynchTube

---
> This is your ultimate sharing place for your newest kitten-videos, your favourite Song or just another Let's Play. Synergytube allows you to create up to 2 own Channels where you can watch videos, livestreams or listen to Music with your friends, strangers or simply everyone. The media will be synced between everyone in the Channel, so everyone gets the same as you do!
Learn more!


## Status
Working and stable (no observed critical crashes when using this)


### Working:
* Login with Password, Google & Facebook
* Channels: Chat & Playlists (almost everything here is implemented)
* Channel creation
* User-Avatars

### To be implemented:
* View Profile
* Channel ettings

## Development
Provide us with Issues, Pull Requests or [write us](mailto:screeny05@gmail.com).

## Q&A

### Whenwhenwhen?
As almost any software, there will never be a real `final` version. But it's working!

### Are you still working on this?
Currently - January 2014 - i'm working on other stuff. But - like already said - the current version is working and somehow stable.

### What is currently working?
see [Status](#working)

### How do I install this?
In order to use this you need some prerequisites:
* [nodejs](http://nodejs.org/) obviously.
* [bower](http://bower.io/) for package managment: `npm install -g bower`.
* [Grunt](http://gruntjs.com/) for building, minifying etc.
* [Redis](http://redis.io/) *optional*, only for session caching.
* [MongoDB](http://www.mongodb.org/) (you can also use a MongoDB-as-a-Service provider like [mongolab](https://mongolab.com/)).
* A [facebook application](https://developers.facebook.com/apps) *optional*, for login with facebook.
* An [avatars.io](https://avatars.io) for avatars obviously.

Commands:
```bash
npm install
bower install

# Not tested yet, not necessary:
grunt
```

In the future there will be already built releases, but currently you won't come arround doing this.

### I've installed it, now show me how to run it!
Why so rude? but i will.

First: be sure to rename the `config.example.js` to just `config.js` and edit the content of this file to your likings.

Second: run it and create your first very own Channel! (after you logged in of course, sorry)

```bash
# rename the config
mv config.example.js config.js

# edit it 'til you're pleased
nano config.js

# run it! you can either just enter this:
node app

# or use something like forever
forever start app.js

```

### Why are you rewriting all this from scratch? it was working!
Because it was crap. We mixed PHP with NodeJS and that felt crappy from the first day on.
I now have time to focus more on the Development of this again, but it's a huge project.
If you want to help, mail me! Any help is appreciated.

### So, what are you going to do different?
[Have a list](https://github.com/TeamSynergy/SynergyTube-deprec/issues/154) about what we want
to do different this time.

### How can i help/contribute otherwise?
Well, we could need a logo. If you don't know much about backends,
but about frontends you may have some fun developing a interface?

### Where do i get answers to my other questions?
[here](https://github.com/TeamSynergy/SynergyTube-deprec)
