(function() {
  'use strict';

  angular.module('hiptory')
    .service('hiMessageService', function($resource) {

      var models = {
        Message: $resource('/api/messages/:year/:month/:day.json')
      };

      /**
       * Fetch messages from api.
       *
       * @param {moment} mdate
       * @returns {Promise}
       */
      this.fetch = function(mdate) {
        return models.Message.query({
          year: mdate.format('YYYY'),
          month: mdate.format('MM'),
          day: mdate.format('DD')
        }).$promise;
      };
    });
})();
