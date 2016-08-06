angular.module('inzApp')
.config(function($stateProvider) {

    $stateProvider
        .state('logout', {
            url:'/logout?referrer',
            referrer:'robots',
            template:'',
            controller: function($state, Auth) {
                var referrer = $state.params.referrer ||
                    $state.current.referrer ||
                    'robots';
                Auth.logout();
                $state.go(referrer);
            }
        });
});
