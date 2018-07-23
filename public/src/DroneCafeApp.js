var droneCafeApp = angular.module('DroneCafeApp', ['ngRoute', 'ngResource']);

angular.
    module('DroneCafeApp')

    .config(['$routeProvider',
        function config($routeProvider) {

            $routeProvider
                .when('/', {
                    templateUrl: 'src/User/User.html',
                    controller: 'UserCtrl'
                })
                .when('/kitchen', {
                    templateUrl: 'src/Kitchen/Kitchen.html',
                    controller: 'KitchenCtrl'
                })
                .otherwise({
                    redirectTo: '/'
                });
        }
    ]);