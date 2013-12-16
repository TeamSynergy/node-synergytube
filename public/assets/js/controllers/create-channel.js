var app = angular.module('synergy', ['synergy.utils']);
app.config(['$interpolateProvider', function($interpolateProvider){
  $interpolateProvider.startSymbol('#{');
  $interpolateProvider.endSymbol('}#');
}]);

app.controller('ChannelCreateController', ['$scope', function($scope){
  $scope.ui = {
    url: {
      text: '',
      sample: 'awesome-channel',
      change: function(){
        this.slugified = this.text.toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-');
      }
    }
  }
}]);
