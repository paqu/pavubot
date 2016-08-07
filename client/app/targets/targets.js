angular.module('inzApp')
.config(function($stateProvider) {

    $stateProvider
        .state('robots', {
            url:'/',
            templateUrl:'app/targets/targets.html',
            controller:'RobotsCtrl'
        })
        .state('target-admin', {
            url:'/robots/:id/admin',
            templateUrl:'app/targets/templates/targets-admin.html',
            authenticate:true
        })
        .state('target-watcher', {
            url:'/targets/:id/watcher',
            templateUrl:'app/targets/templates/targets-watcher.html',
            controller:'TargetCtrl'

        });
});
