angular.module('inzApp')
  .controller('NavbarCtrl', ['$scope','Auth',  function ($scope, Auth) {
     $scope.isLoggedIn = Auth.isLoggedIn;
     $scope.isAdmin    = Auth.isAdmin;
     $scope.getCurrentUser = Auth.getCurrentUser;

     $scope.isCollapsed = true;
     $scope.menu = [{
         'title':'Lista robotów',
         'state':'robots',
     },{
         'title':'Lista poszukiwanych',
         'state':'wanted',
     }]
  }]);
