(function() {
  'use strict';

  angular.module('hiptory')
    .directive('hiNavbar', function($location, hiAuthService) {
      return {
        restrict: 'E',
        templateUrl: '/directives/navbar.html',
        link: function(scope) {

          /**
           * Detect user has ticket or not.
           * @returns {boolean}
           */
          scope.hasTicket = function() {
            return hiAuthService.hasTicket();
          };

          /**
           * Logout.
           */
          scope.logout = function() {
            hiAuthService.logout()
              .then(function() {
                $location.path('/auth');
              });
          };
        }
      };
    });
})();
