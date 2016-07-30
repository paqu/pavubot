angular.module('inzApp')
    .controller('WantedCtrl', ['$scope','Wanted', function ($scope, Wanted) {
        $scope.wanted = Wanted.query(); 
    }])
    .controller('WantedViewCtrl', function ($scope, $state, $stateParams, Wanted) {
        $scope.wanted = Wanted.get({id: $stateParams.id});

    $scope.deleteWanted = function(){
        Wanted.delete($scope.wanted);
        $state.go('wanted');
    }
    })

    .controller('WantedNewCtrl', function ($scope, $state, Wanted) {
        $scope.wanted = {}; // create a new instance
        $scope.addWanted = function(wanted){
        Wanted.create($scope.wanted);
        $state.go('wanted');
    }
    })

    .controller('WantedEditCtrl', function ($scope, $state, $stateParams, Wanted) {
        $scope.wanted = Wanted.get({id: $stateParams.id});

        $scope.editWanted = function(wanted){
        Wanted.update($scope.wanted);
        $state.go('wanted');
        }
    });
