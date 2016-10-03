angular.module('inzApp')
.config(function($stateProvider) {

    $stateProvider
        .state('settings', {
            url:'/settings',
            templateUrl:'app/settings/settings.html',
            controller:'SettingsCtrl'
        });
});
