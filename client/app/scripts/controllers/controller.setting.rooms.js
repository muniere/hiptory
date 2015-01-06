(function() {
  'use strict';

  angular.module('hiptory')
    .controller('SettingRoomsController', function($scope, $modal, $alert, $activityIndicator, hiSettingService) {

      var addModal = $modal({
        scope: $scope,
        template: '/views/_settings.rooms.add.html',
        show: false
      });

      var delModal = $modal({
        scope: $scope,
        template: '/views/_settings.rooms.del.html',
        show: false
      });

      var addSuccessAlert = $alert({
        type: 'success',
        content: 'Added a new Room',
        placement: 'top-right',
        duration: 3,
        show: false
      });

      var delSuccessAlert = $alert({
        type: 'success',
        content: 'Deleted a Room',
        placement: 'top-right',
        duration: 3,
        show: false
      });

      var dangerAlert = $alert({
        type: 'danger',
        content: 'Failed to update room settings',
        placement: 'top-right',
        show: false
      });

      $scope.fetch = function() {
        return hiSettingService.fetch().then(function(settings) {
          $scope.settings = settings;
          $scope.rooms = settings.rooms;
        });
      };

      $scope.addRoom = function() {
        return addModal.$promise.then(addModal.show);
      };

      $scope.delRoom = function(room) {
        $scope.binding.room = room;
        return delModal.$promise.then(delModal.show);
      };

      $scope.doAddRoom = function(id) {
        return hiSettingService.addRoom(id)
          .then(function(settings) {
            addSuccessAlert.show();
            $scope.rooms = settings.rooms;
          })
          .catch(function() {
            dangerAlert.show();
          })
          .finally(function() {
            addModal.hide();
            $scope.binding.room = null;
          });
      };

      $scope.doDelRoom = function(id) {
        return hiSettingService.delRoom(id)
          .then(function(settings) {
            delSuccessAlert.show();
            $scope.rooms = settings.rooms;
          })
          .catch(function() {
            dangerAlert.show();
          })
          .finally(function() {
            delModal.hide();
            $scope.binding.room = null;
          });
      };

      $scope.init = function() {
        $scope.binding = { room: { id: null } };

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
