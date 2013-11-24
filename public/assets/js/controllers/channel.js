var socket = io.connect('/?channel=' + $('body').data('shortstring'));

angular.module('synergy', []).controller('ChannelController', ['$scope', function($scope){
  socket.on('channel.init', function(data){
    console.log(data);
    $scope.playlist = data.playlist;
    $scope.$apply();
  });

  $scope.pad = function(val){
    return ('00' + val).slice(-2);
  };

  $scope.getDuration = function(t){
    t = new Date(t * 1000);
    return $scope.pad(t.getMinutes()) + ":" + $scope.pad(t.getSeconds());
  }
}]);
