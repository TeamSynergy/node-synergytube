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

### __Whenwhenwhen?__  
Never. But we'll have it working soon! I believe in a basic working server until end of december.

### __Are you still working on this?__  
As hard as we can.

### __What is currently working?__  
Login, models should be finished

### __How do I install this?__  
In order to use this you need some prerequisites:
* [nodejs](http://nodejs.org/) obviously.
* [bower](http://bower.io/) for package managment. `npm install -g bower`
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

### __Why are you rewriting all this from scratch? it was working!__  
Because it was crap. We mixed PHP with NodeJS and that felt crappy from the first day on.
I now have time to focus more on the Development of this again, but it's a huge project.
If you want to help, mail me! Any help is appreciated.

### __So, what are you going to do different?__  
[Have a list](https://github.com/TeamSynergy/SynergyTube-deprec/issues/154) about what we want
to do different this time.

### __How can i help/contribute otherwise?__  
Well, we could need a logo. If you don't know much about backends,
but about frontends you may have some fun developing a interface?

### __Where do i get answers to my other questions?__  
[here](https://github.com/TeamSynergy/SynergyTube-deprec)
