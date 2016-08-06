'use strict';

angular.module('inzApp', [
  'inzApp.auth',
  'inzApp.admin',
  'inzApp.constants',
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'btford.socket-io',
  'ui.router',
  'ui.bootstrap',
  'validation.match'
]);

angular.module('inzApp')
.config(function($urlRouterProvider, $locationProvider) {
    $urlRouterProvider.otherwise('/');
    //$locationProvider.html5Mode(true);
})
