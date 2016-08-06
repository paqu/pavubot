'use strict';

angular.module('inzApp.auth', [
  'inzApp.constants',
  'inzApp.util',
  'ngCookies',
  'ui.router'
])
  .config(function($httpProvider) {
    //$httpProvider.interceptors.push('authInterceptor');
  });
