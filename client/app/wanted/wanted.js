angular.module('inzApp')
.config(function($stateProvider) {

    $stateProvider
        .state('wanted', {
            url:'/wanted',
            templateUrl:'app/wanted/templates/wanted-list.html',
            controller:'WantedCtrl'
        })
        .state('newWanted', {
            url:'/wanted/new',
            templateUrl:'app/wanted/templates/wanted-new.html',
            controller:'WantedNewCtrl'
        })
        .state('viewWanted', {
            url:'/wanted/:id',
            templateUrl:'app/wanted/templates/wanted-view.html',
            controller:'WantedViewCtrl'
        })
        .state('editWanted', {
            url:'/wanted/:id/edit',
            templateUrl:'app/wanted/templates/wanted-edit.html',
            controller:'WantedEditCtrl'
        });
});
