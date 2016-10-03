angular.module('inzApp')
    .controller('LoginCtrl', ['$scope','$state','Auth',function ($scope, $state, Auth) {
      $scope.user = {};
      $scope.errors = {};
      $scope.submitted = false;


      $scope.login = function (form) {
        $scope.submitted = true;

        if (form.$valid) {
          Auth.login({
            email: $scope.user.email,
            password: $scope.user.password
          })
          .then(() => {
            $state.go('robots');
          })
          .catch(err => {
            $scope.errors.other = err.message;
          });
        }
      }
    }]);
