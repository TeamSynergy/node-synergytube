# SynergyTube
> SynergyTube aims to provide an alternative to the now shut-down SynchTube

## Status
### Working:
* Loginsystem
* Profiles
* Playlist (basic support)
* Chat

### To be implemented:
* Profiles (of other users)
* Channel-Administration
* AAAALLL the stuff, unfinished in lib/sockethandler.js

## Development
Provide us with Issues, Pull Requests or [write us](mailto:screeny05@gmail.com).

## Q&A

### Whenwhenwhen?
Never. But we'll have it working soon! I believe in a basic working server until end of december.

### Are you still working on this?
As hard as we can.

### What is currently working?
Login, models should be finished

### How do I install this?
In order to use this you need some prerequisites:
* [nodejs](http://nodejs.org/) obviously.
* [bower](http://bower.io/) for package managment: `npm install -g bower`.
* [Grunt](http://gruntjs.com/) for building, minifying etc.
* [Redis](http://redis.io/) (optional, only for session caching).
* [MongoDB](http://www.mongodb.org/) (you can also use a MongoDB-as-a-Service-Provider like [mongolab](https://mongolab.com/)).
* A [facebook application](https://developers.facebook.com/apps) for login.
* An [avatars.io](https://avatars.io) for avatars obviously.

Commands:
```bash
npm install
bower install

# Currently not working:
grunt
```

In the future there will be already built releases, but currently you won't come arround this.

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
