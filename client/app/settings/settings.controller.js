angular.module('inzApp')
    .controller('SettingsCtrl', ['$scope','$state','Auth',function ($scope, $state, Auth) {
      $scope.user = {};
      $scope.errors = {};
      $scope.submitted = false;


      $scope.changePassword = function (form) {
        $scope.submitted = true;

        if (form.$valid) {
          Auth.changePassword(
              $scope.user.oldPassword,
              $scope.user.newPassword
          )
          .then(() => {
              $scope.message = "Hasło zostało zmienione";
          })
          .catch(err => {
              form.password.$setValidity('mongoose', false);
              $errors.other = "Niepoprawne hasło";
              $scope.message = "";
          });
        }
      }
    }]);
