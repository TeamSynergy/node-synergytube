var app = angular.module('synergy', []);
app.controller('ValidateCtrl', function($scope){
	$scope.submit = function(){
		console.log(this.$valid);
	};
});