angular.module('inzApp')
    .controller('WantedCtrl', ['$scope','$http', 'Wanted', function ($scope, $http, Wanted) {
        $scope.wanted = Wanted.query(); 

        $scope.addToWantedList = addToWantedList;
        $scope.removeFromWantedList = removeFromWantedList;


        function addToWantedList(WantedId) {
            var id = _findId(WantedId, $scope.wanted);
            _setWantedStatus(id,true,$scope.wanted);
            $http.post('/api/wanted/addToList/' + WantedId);
        }

        function removeFromWantedList(WantedId) {
            var id = _findId(WantedId, $scope.wanted);
            _setWantedStatus(id,false,$scope.wanted);
            $http.delete('/api/wanted/removeFromList/' + WantedId);
        }

        function _findId(id, arr) {
            for (var i = 0; i < arr.length; i++) {
                if (arr[i]._id == id)
                    return i;
            }
            return -1;
        }

        function _setWantedStatus(id,val,arr) {
            arr[id].status = val;
        }

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
