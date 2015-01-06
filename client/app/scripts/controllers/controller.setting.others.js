(function() {
  'use strict';

  angular.module('hiptory')
    .controller('SettingOthersController', function($scope, $alert, $activityIndicator, hiSettingService) {

      var successAlert = $alert({
        type: 'success',
        content: 'Saved setings',
        placement: 'top-right',
        duration: 3,
        show: false
      });

      var dangerAlert = $alert({
        type: 'danger',
        content: 'Failed to update settings',
        placement: 'top-right',
        show: false
      });

      $scope.fetch = function() {
        return hiSettingService.fetch().then(function(settings) {
          $scope.settings = settings;
        });
      };

      $scope.update = function() {
        return hiSettingService.updateNotification($scope.settings.notification)
          .then(function() {
            successAlert.show();
          })
          .catch(function() {
            dangerAlert.show();
          });
      };

      $scope.init = function() {
        $activityIndicator.startAnimating();

        return $scope.fetch()
          .then(function() {
            $scope.ready = true;
          })
          .catch(function(err) {
            $scope.error = err;
          })
          .finally(function() {
            $activityIndicator.stopAnimating();
          });
      };
    });
})();
