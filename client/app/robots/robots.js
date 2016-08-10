angular.module('inzApp')
.config(function($stateProvider) {

    $stateProvider
        .state('robots', {
            url:'/',
            templateUrl:'app/robots/robots.html',
            controller:'RobotsCtrl'
        })
        .state('robot-control', {
            url:'/robots/:id/admin',
            templateUrl:'app/robots/templates/robot-control.html',
            authenticate:true
        })
        .state('robot-watcher', {
            url:'/robots/:id/watcher',
            templateUrl:'app/robots/templates/robot-watcher.html',
        });
});
