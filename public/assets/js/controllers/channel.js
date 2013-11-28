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
    $scope.playlist = data.channel.playlist;
    $scope.chat = data.channel.messages;
    $scope.users = data.users;

    $scope.$apply();
    $('#chat').scrollTop($('#chat')[0].scrollHeight);
  });

  socket.on('chat.send', function(message){
    var $e = $('#chat');
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
