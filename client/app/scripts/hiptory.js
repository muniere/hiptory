(function() {
  'use strict';
  /* global moment */

  angular.module('hiptory', [
    'ngAnimate',
    'ngSanitize',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'mgcrea.ngStrap',
    'ngActivityIndicator'
  ]).config(function($locationProvider, $routeProvider, $httpProvider) {
    $locationProvider.html5Mode(true);
    $httpProvider.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

    $routeProvider
      .when('/', {
        templateUrl: '/views/messages.html',
        controller: 'MessageController'
      })
      .when('/auth', {
        templateUrl: '/views/auth.html',
        controller: 'AuthController'
      })
      .when('/messages', {
        redirectTo: '/messages/' + moment().format('YYYY/MM/DD')
      })
      .when('/messages/:year/:month/:day', {
        templateUrl: '/views/messages.html',
        controller: 'MessageController'
      })
      .when('/settings', {
        redirectTo: '/settings/rooms'
      })
      .when('/settings/rooms', {
        templateUrl: '/views/settings.rooms.html',
        controller: 'SettingRoomsController'
      })
      .when('/settings/others', {
        templateUrl: '/views/settings.others.html',
        controller: 'SettingOthersController'
      });
  }).run(function($rootScope, $location, hiAuthService) {
    $rootScope.$on('$routeChangeStart', function() {
      if ($location.path() !== '/auth' && !hiAuthService.hasTicket()) {
        $location.path('/auth');
      }
    });

    hiAuthService.test().catch(function() {
      $location.path('/auth');
    });
  });
})();
