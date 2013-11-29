var socket = io.connect('/?channel=' + $('body').data('shortstring'));

var app = angular.module('synergy', ['ngAnimate', 'angularMoment', 'synergy.utils']);
app.config(['$interpolateProvider', function($interpolateProvider){
  $interpolateProvider.startSymbol('#{');
  $interpolateProvider.endSymbol('}#');
}]);

app.controller('ChannelController', ['$scope', function($scope){
  $scope.me = $('body').data('user');

  socket.on('channel.init', function(data){
    console.log(data);

    // prevent reinit on server-reload
    // TODO: remove in production
    if($scope.inited)  return;
    $scope.inited = true;

    $scope.playlist = data.channel.playlist.sort(function(a, b){ return a.position - b.position });
    $scope.mc.current = data.channel.playlist.sort(function(a, b){ return new Date(b.start_time) - new Date(a.start_time) })[0];

    $scope.chat = data.channel.messages;
    $scope.users = data.users;


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
    nextFn: function(apply){
      socket.emit('playlist.next');
      var n = $scope.mc.getNext();
      n.start_time = new Date();
      console.log('next item is:', n);

      $scope.mc.current = n;
      if(apply){
        // if apply is true, then we're in an async callback
        // so we need to apply the new video.
        // at least that's my theory..
        $scope.$apply();
      }
    },
    getNext: function(){
      // since our playlist is sorted by position,
      // this should return the next item.
      var byPos = $scope.playlist.sort(function(a, b){ return a.position - b.position });
      var next = byPos[$scope.mc.current.position];

      if(!next)
        return byPos[0];
      else
        return next;
    }
  };

  $scope.ui = {
    inputAdd: {
      show: false,
      toggle: function(){
        this.show = !this.show;
        if(this.show){
          this.text = '';
          $scope.ui.inputSearch.show = false;
          setTimeout(function(){$('#inputAdd').focus();}, 0);
        }
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
