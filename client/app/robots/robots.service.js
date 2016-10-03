angular.module('inzApp')
.factory('Targets', ['$resource', function ($resource) {
    return $resource('/api/targets/:id', {
        id:null
    },
    {
        get: {
            method:'GET'
        }
    });
}]);
