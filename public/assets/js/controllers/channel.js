var socket = io.connect('/?channel=' + $('body').data('shortstring'));

angular.module('synergy', ['ngAnimate']).controller('ChannelController', ['$scope', function($scope){
  socket.on('channel.init', function(data){
    console.log(data);
    $scope.playlist = data.playlist;
    $scope.chat = data.messages;
    $scope.$apply();
  });

  $scope.pad = function(val){
    return ('00' + val).slice(-2);
  };

  $scope.getDuration = function(t){
    t = new Date(t * 1000);
    return $scope.pad(t.getMinutes()) + ":" + $scope.pad(t.getSeconds());
  }

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
    }
  }
}]);
