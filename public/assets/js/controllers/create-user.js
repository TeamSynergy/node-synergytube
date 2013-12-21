var app = angular.module('synergy', []);
app.config(['$interpolateProvider', function($interpolateProvider){
  $interpolateProvider.startSymbol('#{');
  $interpolateProvider.endSymbol('}#');
}]);

app.controller('UserCreateController', ['$scope', function($scope){

  $scope.ui = {
    messages: [],

    valid: function(){
      $scope.ui.messages = [];
      var v = true;

      if(!$scope.ui.email || $scope.ui.email.indexOf('@') === -1 || $scope.ui.email.split('@').length < 2){
        v = false;
        $scope.ui.messages.push('Enter a valid Email.');
      }

      if(!$scope.ui.displayname){
        v = false;
        $scope.ui.messages.push('Enter a Displayname.');
      }

      if(!$scope.ui.password || $scope.ui.password.length <= 6){
        v = false;
        $scope.ui.messages.push('The password must be longer than 6 chars.');
      } else {

        if($scope.ui.password !== $scope.ui.passwordRepeat){
          v = false;
          $scope.ui.messages.push('The given passwords do not match.')
        }

      }

      return v;
    },

    email: '',
    displayname: '',
    password: '',
    passwordRepeat: '',

    manualDisplayname: false,

    emailChange: function(){
      if(!$scope.ui.manualDisplayname){
        var username = $scope.ui.email.split('@')[0];
        username = username.charAt(0).toUpperCase() + username.slice(1);
        $scope.ui.displayname = username;
      }
    }
  }
}]);
