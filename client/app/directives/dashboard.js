(function() {
  'use strict';

  angular.module('hiptory')
    .directive('hiDashboard', function() {
      return {
        restrict: 'E',
        templateUrl: '/directives/dashboard.html',
        link: function(scope, elem, attrs) {
          scope.active = attrs.active;
        }
      };
    });
})();
