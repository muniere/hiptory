(function() {
  'use strict';

  angular.module('hiptory')
    .controller('AuthController', function($scope, $location, $timeout, $alert, hiAuthService) {

      var dangerAlert = $alert({
        type: 'danger',
        content: 'Authentication failed',
        placement: 'top-right',
        show: false
      });

      $scope.login = function() {
        return hiAuthService.login($scope.credentials)
          .then(function() {
            // use $timeout to wait for writing cookies
            $timeout(function() {
              $location.path('/');
            }, 100);
          })
          .catch(function() {
            dangerAlert.$promise.then(dangerAlert.show);
          });
      };

      $scope.init = function() {
        $scope.credentials = { token: null };
      };
    });
})();
