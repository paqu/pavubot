'use strict';

angular.module('inzApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'btford.socket-io',
  'ui.router',
  'ui.bootstrap',
  'validation.match'
]);

angular.module('inzApp')
.config(function($stateProvider, $urlRouterProvider) { //, $locationProvider) {

    $urlRouterProvider.otherwise('/');
    $stateProvider
        .state('test', {
            url:'/test',
            templateUrl:'app/targets/test.html',
            controller:'TargetsCtrl'
        });

    //$locationProvider.html5Mode(true);

});
