var app = angular.module('synergy', []);
app.config(['$interpolateProvider', function($interpolateProvider){
  $interpolateProvider.startSymbol('#{');
  $interpolateProvider.endSymbol('}#');
}]);

app.controller('MyProfileController', ['$scope', '$sce', function($scope, $sce){
  $scope.avatar = {
    url: function(){
      if(this.radio === 'facebook')
        return '//graph.facebook.com/' + this.fbid + '/picture?width=256&height=256';
      if(this.radio === 'google')
        return this.default;  // TODO
      if(this.radio === 'gravatar')
        return '//secure.gravatar.com/avatar/' + this.gravatar + '?s=256&d=identicon';
      if(this.radio === 'twitter')
        return $scope.ui.username ? '//avatars.io/twitter/' + encodeURIComponent($scope.ui.username) + '?size=large' : this.current;
      if(this.radio === 'upload')
        return this.datauri || this.current;
      if(this.radio === 'default')
        return this.default;
    },
    radio: $('body').data('current-provider'),
    fbid: $('body').data('fbid'),
    ggid: $('body').data('ggid'),
    gravatar: $('body').data('gravatar'),
    default: $('body').data('default'),
    current: $('body').data('current-url')
  };

  $scope.ui = {
    displayname: $('body').data('ui-displayname'),
    email: $('body').data('ui-email'),
    valid: function(){
      var r = true;
      this.messages = [];

      if(this.password){
        if(this.password !== this.passwordRepeat){
          r = false;
          this.messages.push('The given passwords do not match.');
        }
        if(this.password.length <= 6){
          r = false;
          this.messages.push('The password must be longer than 6 chars.')
        }
      }

      if($scope.avatar.radio === 'upload'){
        var img = document.getElementById('avatar');
        if(img.naturalHeight !== img.naturalWidth){
          r = false;
          this.messages.push('The Image to upload has to be a square. Eg: 128x128, 256x256, etc. Your size is ' + img.naturalWidth + 'x' + img.naturalHeight + '.');
        }
        if($scope.avatar.size > 2 * 1024 * 1024){
          r = false;
          this.messages.push('The filesize is limited to 2mb, your image is ' + Math.round($scope.avatar.size / 1024 / 1024 * 10) / 10 + 'mb heavy.');
        }
      }

      if($scope.avatar.radio === 'twitter'){
        if(!this.username){
          r = false;
          this.messages.push('Please provide a username.');
        }
      }

      return r;
    },
    messages: []
  };

  $scope.clickUpload = function(){
    $('#avatarupload').click();
  };
  $scope.fileSelected = function(that){
    var r = new FileReader();
    r.onload = function(f){
      $scope.avatar.size = f.total;
      $scope.avatar.datauri = f.target.result;
      $scope.$apply();
    };
    r.readAsDataURL(that.files[0]);
  };
  $scope.checkImageSize = function(){

  };
}]);
