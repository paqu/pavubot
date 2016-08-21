angular.module('inzApp')
.factory('Socket',['socketFactory', function (socketFactory) {
    var myIoSocket = io.connect('/user');
    return socketFactory({ioSocket:myIoSocket});
}])
.factory('VideoSocket',['socketFactory', function (socketFactory) {
    var myIoSocket = io.connect('/video');
    return socketFactory({ioSocket:myIoSocket});
}]);

