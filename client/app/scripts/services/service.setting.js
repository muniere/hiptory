(function() {
  'use strict';

  angular.module('hiptory')
    .service('hiSettingService', function($resource) {

      var models = {
        Setting: $resource('/api/settings.json', {}, { update: { method: 'PATCH' } })
      };

      /**
       * Fetch settings from api.
       *
       * @returns {ng.IPromise}
       */
      this.fetch = function() {
        return models.Setting.get().$promise;
      };

      /**
       * Update notification settings.
       *
       * @returns {ng.IPromise}
       */
      this.addRoom = function(id) {
        return models.Setting.update({ add_rooms: [id] }).$promise;
      };

      /**
       * Update notification settings.
       *
       * @returns {ng.IPromise}
       */
      this.delRoom = function(id) {
        return models.Setting.update({ del_rooms: [id] }).$promise;
      };

      /**
       * Update notification settings.
       *
       * @returns {ng.IPromise}
       */
      this.updateNotification = function(value) {
        return models.Setting.update({ notification: value }).$promise;
      };
    });
})();
