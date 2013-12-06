var socket = io.connect('/?channel=' + $('body').data('shortstring'));

var app = angular.module('synergy', ['ngAnimate', 'ngSanitize', 'angularMoment', 'synergy.utils']);
app.config(['$interpolateProvider', function($interpolateProvider){
  $interpolateProvider.startSymbol('#{');
  $interpolateProvider.endSymbol('}#');
}]);

app.controller('ChannelController', ['$scope', function($scope){
  $scope.me = $('body').data('user');
  $scope.playlist = [];

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


    $scope.$apply();
    $('#chat').scrollTop($('#chat')[0].scrollHeight);
  });

  socket.on('playlist.play', function(item){
    console.log('force-play', item);
    $scope.mc.current = item;
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

    if(toScroll)
      $e.animate({ scrollTop: $e[0].scrollHeight}, 200);
  });

  socket.on('guest.leave', function(){
    // ALL HAIL CROCKFORD!
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

  $scope.pad = function(val){
    return ('00' + val).slice(-2);
  };

  $scope.getDuration = function(t){
    t = new Date(t * 1000);
    return $scope.pad(t.getMinutes()) + ":" + $scope.pad(t.getSeconds());
  };

  // TODO: add proper handler
  socket.on('err', console.warn);

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
    getWhereId: function(_id){
      angular.forEach($scope.playlist, function(item){
        if(item._id === _id)
          return _id;
      });

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
      if($scope.playlist.length === 1)  return $scope.current._id;
      if($scope.playlist.length === 2)  return $scope.mc.getNext();

      var r;
      while(true){
        r = Math.floor(Math.random() * $scope.playlist.length);
        if($scope.playlist[r]._id !== $scope.mc.current._id)  return $scope.playlist[r];
      }
    },

    forcePlay: function(_id, supresswarning){
      if(!$scope.me.owner && !$scope.me.admin)
        if(!supresswarning)  return console.log('//TODO: throw error');
        else return;

      // if id is a item, use it. else search for the id.
      _id = typeof _id === 'object' ? _id : $scope.mc.getWhereId(_id);
      // ignore item change if it has the same id.
      if(_id._id === $scope.mc.current._id)  return;

      $scope.mc.current = _id;
      $scope.mc.current.start_time = new Date();

      socket.emit('playlist.play', $scope.mc.current);
    }
  };

  $scope.ui = {
    inputAdd: {
      show: false,
      text: '',
      currentItem: false,
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

        x.getMediaInfo(prs.provider, prs.id, function(data){
          console.log(data);
          if(!data)  return;
          $scope.ui.inputAdd.currentItem = data;
          $scope.$apply();
        });
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
        if(this.text && this.text.replace(' ', '')){
          socket.emit('chat.send', { content: this.text.trim() });
          this.text = '';
        }
      }
    }
  };

}]);
