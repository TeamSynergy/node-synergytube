var app = angular.module('synergy', ['synergy.utils', 'monospaced.elastic']);
app.config(['$interpolateProvider', function($interpolateProvider){
  $interpolateProvider.startSymbol('#{');
  $interpolateProvider.endSymbol('}#');
}]);

app.controller('ChannelCreateController', ['$scope', function($scope){

  $scope.ui = {
    messages: [],

    valid: function(){
      $scope.ui.messages = [];
      var v = true;

      if(!$scope.ui.title.text || $scope.ui.title.text.length > 20){
        v = false;
        $scope.ui.messages.push('Enter a Channelname which is at most 20 characters long.')
      }


      if(!$scope.ui.url.text || $scope.ui.url.text.length < 4 || $scope.ui.url.text.length > 20){
        v = false;
        $scope.ui.messages.push('Enter a Short String for the Channel\'s URL which is at least 4 Characters long and at most 40.');


      } else if(!/^[a-z0-9\-]*$/.test($scope.ui.url.text)){
        v = false;
        $scope.ui.messages.push('Short String must contain only of small characters, numbers and dashes.');
      }

      if(!$scope.ui.desc.text || $scope.ui.desc.text.length < 40 || $scope.ui.desc.text.length > 400){
        v = false;
        $scope.ui.messages.push('Your description has to be at least 40 and at most 400 Characters long.')
      }

      return v;
    },

    title: {
      text: '',
      bound: true,
      change: function(){
        if(this.bound){
          var s = _.str.trim(_.str.slugify(this.text), '-');
          $scope.ui.url.text = s;
          $scope.ui.url.slugified = s;
        }
      }
    },

    url: {
      text: '',
      change: function(unset){
        if(!unset)  $scope.ui.title.bound = false;
        this.slugified = _.str.trim(_.str.slugify(this.text), '-');
      },
      click: function(){
        this.text = $scope.ui.title.text;
        this.change(true);
      }
    },

    desc: {
      text: ''
    }
  }
}]);
