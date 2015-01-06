(function() {
  'use strict';

  angular.module('hiptory')
    .service('hiAuthService', function($cookies, $resource) {

      var models = {
        Auth: $resource('/api/auth.json')
      };

      /**
       * Detect user has ticket or not.
       * @returns {boolean}
       */
      this.hasTicket = function() {
        return !!$cookies.ticket;
      };

      /**
       * Login.
       * @param {Object} credentials
       * @param {string} credentials.token
       */
      this.login = function(credentials) {
        return models.Auth.save(credentials).$promise;
      };

      /**
       * Logout.
       * @returns {Promise}
       */
      this.logout = function() {
        return models.Auth.remove().$promise;
      };

      /**
       * Test logged in or not.
       * @returns {Promise}
       */
      this.test = function() {
        return models.Auth.get().$promise;
      };
    });
})();
