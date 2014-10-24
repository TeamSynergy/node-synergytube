var socket = io.connect('/?channel=' + $('body').data('shortstring'));

var app = angular.module('synergy', ['synergy.anim', 'ngSanitize', 'angularMoment', 'synergy.utils', 'ui.sortable']);
app.config(['$interpolateProvider', function($interpolateProvider){
  $interpolateProvider.startSymbol('#{');
  $interpolateProvider.endSymbol('}#');
}]);

app.controller('ChannelController', ['$scope', function($scope){
  $scope.me = $('body').data('user');
  $scope.playlist = [];
  $scope.chat = [];


  socket.on('channel.init', function(data){
    console.log(data);

    // Even if the server reloads: be sure to don't have dupe users
    $scope.users = data.users;
    $scope.guests = data.guests;

    // prevent reinit on server-reload
    if($scope.inited)  return;
    $scope.inited = true;

    $scope.playlist = data.channel.playlist.sort(function(a, b){ return a.position - b.position });
    $scope.mc.current = data.channel.playlist.sort(function(a, b){ return new Date(b.start_time) - new Date(a.start_time) })[0];

    $scope.chat = data.channel.messages;

    // am i owner||admin?
    $scope.me.owner = data.me.owner;
    $scope.me.admin = data.me.admin;

    // is this channel faved?
    if($scope.me.favourites){
      $scope.me.favourites.forEach(function(channel){
        if(channel._id === $('body').data('channel-id')){
          $scope.me.faved = true;
        }
      });
    }

    $scope.mc.plstSort.disabled = !($scope.me.owner || $scope.me.admin);

    $scope.ui.inputAdd.show = $scope.playlist.length === 0;


    $scope.$apply();
    $('#chat').scrollTop($('#chat')[0].scrollHeight);
  });

  // TODO: add proper handler
  socket.on('err', function(err){console.error('server-error', err); });


  socket.on('playlist.push', function(item){
    console.log('new item', item);
    $scope.playlist.push(item);
    $scope.$apply();
  });
  socket.on('playlist.play', function(item){
    console.log('force-play', item);
    $scope.mc.current = item;
    $scope.$apply();
  });
  socket.on('playlist.delete', function(deleteitem){
    console.log('remove item', deleteitem);

    var found = false;
    // iterate through our playlist.
    for (var i = 0; i < $scope.playlist.length; i++) {
      if($scope.playlist[i]._id === deleteitem._id){
        // remove the item we've found and break the loop.
        $scope.playlist.splice(i, 1);
        found = true;
        break;
      }
    };

    if(!found)  return socket.emit('playlist.get');

    if($scope.playlist.length === 0){
      $('#player').children().replaceWith('<span class="error">No Item :(</span>');
      if(($scope.me.owner || $scope.me.admin) && !$scope.ui.inputAdd.show){
        $scope.ui.inputAdd.toggle();
      }
    }

    $scope.mc.plstAlign();
    $scope.$apply();
  });
  socket.on('playlist.move', function(serverplaylist){
    if(!serverplaylist)  return socket.emit('playlist.get');
    console.log('move playlist');

    var reqNew = false;
    angular.forEach($scope.playlist, function(myitem){
      if(reqNew)  return;

      for (var i = 0; i < serverplaylist.length; i++) {
        if(serverplaylist[i]._id === myitem._id){
          myitem.position = serverplaylist[i].position;
          return;
        }
      };

      reqNew = true;
    });

    if(reqNew)  return socket.emit('playlist.get');

    $scope.$apply();
  });
  socket.on('playlist.get', function(playlist){
    $scope.playlist = playlist;
    $scope.$apply();
  });

  socket.on('chat.send', function(message){
    var $e = $('#chat');
    // toScroll determines if we should scroll to the bottom
    // on a new message. (kind of annoying without check,
    // if you read messages which are not at the bottom)
    var toScroll = $e[0].scrollHeight - $e.scrollTop() - $e.outerHeight() <= 100;

    $scope.chat.push(message);

    $scope.$apply();

    if(toScroll){
      $e.animate({ scrollTop: $e[0].scrollHeight}, 200);
    }
  });
  socket.on('chat.more', function(messages){
    $scope.cc.allLoaded = messages.length === 0;
    $scope.cc.loading = false;

    if($scope.cc.allLoaded) return $scope.$apply();

    console.log('new messages', messages);
    $scope.chat = $scope.chat.concat(messages);
    $scope.cc.loading = false;
    $scope.$apply();
    $('#chat').scrollTop($scope.cc.scrollItem.offset().top - $('#chat').offset().top + $('#chat').scrollTop());
  });

  socket.on('guest.leave', function(){
    // all hail Crockford!
    $scope.guests = $scope.guests - 1;
    $scope.$apply();
  });
  socket.on('guest.join', function(){
    $scope.guests = $scope.guests + 1;
    $scope.$apply();
  });
  socket.on('user.leave', function(data){
    for (var i = 0; i < $scope.users.length; i++) {
      if($scope.users[i]._id === data._id)
        $scope.users.splice(i, 1);
    };
    $scope.$apply();
  });
  socket.on('user.join', function(user){
    console.log('user joined:', user.name);
    $scope.users.push(user);
    $scope.$apply();
  });

  socket.on('channel.favourite', function(currentState){
    $scope.me.faved = currentState;
    $scope.$apply();
  });

  // mc = mediacontroller
  $scope.mc = {
    nextFn: function(){
      var n = $scope.mc.getNext();
      n.start_time = new Date();
      console.log('next item is:', n);

      $scope.mc.current = n;
      socket.emit('playlist.next', $scope.mc.current);
    },
    plstByPos: function(){
      return $scope.playlist.sort(function(a, b){ return a.position - b.position });
    },
    plstContains: function(provider, id){
      for (var i = 0; i < $scope.playlist.length; i++) {
        if($scope.playlist[i].provider === provider && $scope.playlist[i].media_id === id)
          return true;
      };
      return false;
    },
    getWhereId: function(_id){
      _id = typeof _id === 'object' ? _id._id : _id;
      for (var i = 0; i < $scope.playlist.length; i++) {
        if($scope.playlist[i]._id === _id)
          return $scope.playlist[i]._id;
      };
      return null;
    },
    getNext: function(){
      // since our playlist is sorted by position,
      // this should return the next item.
      var byPos = $scope.mc.plstByPos();
      var next = byPos[$scope.mc.current.position];

      return next ? next : byPos[0];
    },
    getPrevious: function(){
      // the same as above but the other way round
      // Note mc.current.position is one-based. sub 2.
      var byPos = $scope.mc.plstByPos();

      var prevPos = $scope.mc.current.position - 2;
      prevPos = prevPos >= 0 ? prevPos : $scope.playlist.length - 1;

      return byPos[prevPos];
    },
    getRandom: function(){
      // some special cases needed for not crashing our app.
      if($scope.playlist.length === 0)  return;
      if($scope.playlist.length === 1)  return;
      if($scope.playlist.length === 2)  return $scope.mc.getNext();

      var r;
      var rounds = 0;
      // prevent more than 10 tries
      while(rounds < 10){
        rounds = rounds + 1;
        r = Math.floor(Math.random() * $scope.playlist.length);
        if($scope.playlist[r]._id !== $scope.mc.current._id)  return $scope.playlist[r];
      }
    },

    forcePlay: function(_id, supresswarning){
      if(!$scope.me.owner && !$scope.me.admin)
        if(!supresswarning)  return console.warn('//TODO: throw error');
        else return;

      // if id is a item, use it. else search for the id.
      _id = typeof _id === 'object' ? _id : $scope.mc.getWhereId(_id);
      // ignore item change if it has the same id.
      if(_id._id === $scope.mc.current._id)  return;

      socket.emit('playlist.play', _id);
    },
    remove: function(item){
      // we don't want two remove-processes working on the same item
      if(item.removing)  return console.warn('item is already being removed');

      item.removing = true;
      socket.emit('playlist.delete', item);
    },
    plstAlign: function(){
      $scope.playlist.sort(function(a, b){ return a.position - b.position; });
      angular.forEach($scope.playlist, function(item, key){
        item.position = key + 1;
      });
    },
    plstSort: {
      axis: 'y',
      scroll: false,
      forceHelperSize: true,
      disabled: true,
      update: function(e, ui){
        console.log($scope.me);
        if(!($scope.me.owner || $scope.me.admin))  return console.log('neither owner nor admin');

        console.log('reorder');

        $scope.playlist.sort(function(a, b){ return a.position - b.position });
        $scope.playlist.splice(ui.item.sortable.dropindex, 0, $scope.playlist.splice(ui.item.sortable.index, 1)[0]);
        // for debugging purposes:
        // angular.forEach($scope.playlist,function(i){console.log(i.position, i.name)});

        for (var i = 0; i < $scope.playlist.length; i++) {
          $scope.playlist[i].position = i + 1;
        };

        $scope.mc.plstAlign();

        socket.emit('playlist.move', $scope.playlist.map(function(i){ return { _id: i._id, position: i.position }; }));
      }
    }
  };

  $scope.ui = {
    inputAdd: {
      show: false,
      text: '',
      currentItem: false,
      working: false,
      warning: false,
      available: false,
      toggle: function(){
        this.show = !this.show;
        if(this.show){
          this.text = '';
          this.currentItem = false;
          $scope.ui.inputSearch.show = false;
          setTimeout(function(){$('#inputAdd').focus();}, 0);
        }
      },
      change: function(){
        var x   = $('#player').xmbd();
        var inp = $scope.ui.inputAdd.text;
        var prs = x.getMediaId(inp);

        $scope.ui.inputAdd.working = true;
        $scope.ui.inputAdd.available = false;
        $scope.ui.inputAdd.currentItem = false;

        x.getMediaInfo(prs.provider, prs.id, function(err, data){
          $scope.ui.inputAdd.working = false;

          console.log(err, data);

          if(err || !data){
            $scope.ui.inputAdd.currentItem = false;
            return;
          } else {
            $scope.ui.inputAdd.currentItem = data;
            $scope.ui.inputAdd.available = data.available;
          }


          if($scope.mc.plstContains(data.provider, data.id)){
            $scope.ui.inputAdd.warning = 'Duplicate';
          } else if(!data.available) {
            $scope.ui.inputAdd.warning = 'Unvailable';
          } else {
            $scope.ui.inputAdd.warning = false;
          }

          $scope.$apply();
        });
      },
      submit: function(){
        // in case of something strange (eg: user invocating this method)
        if(!$scope.ui.inputAdd.currentItem)  return;

        socket.emit('playlist.push', $scope.ui.inputAdd.currentItem);
        $scope.ui.inputAdd.show = false;
      }
    },

    inputSearch: {
      show: false,
      toggle: function(){
        this.show = !this.show;
        if(this.show){
          this.text = '';
          $scope.ui.inputAdd.show = false;
          setTimeout(function(){$('#inputSearch').focus();}, 0);
        }
      }
    },

    inputMessage: {
      text: '',
      submit: function(){
        if(this.text && this.text.replace(/\s*/g, '').length > 0){
          socket.emit('chat.send', { content: this.text.trim() });
          this.text = '';
        }
      }
    }
  };

  // cc = ChatController
  $scope.cc = {
    more: function(){
      if(!$scope.cc.loading && !$scope.cc.allLoaded){
        // we have to use the second child, because the frst is our loading bar
        $scope.cc.scrollItem = $($('#chat > li')[1]);
        $scope.cc.loading = true;

        var firstmessage = $scope.chat.sort(function(a, b){ return new Date(a.timestamp) - new Date(b.timestamp) })[0];
        socket.emit('chat.more', firstmessage);
      }
    },
    loading: false,
    allLoaded: false,
    scrollTo: 0
  }

  // etc = Etc. Controller <:
  $scope.etc = {
    fav: function(){
      if($scope.me.logged_in){
        socket.emit('channel.favourite', !$scope.me.faved);
      }
    }
  }


}]);
