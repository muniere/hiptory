(function() {
  'use strict';
  /* global moment */

  angular.module('hiptory')
    .controller('MessageController', function($scope, $location, $timeout, $routeParams, $activityIndicator, hiMessageService) {

      $scope.fetch = function() {
        return hiMessageService.fetch(moment($scope.date)).then(function(messages) {
          $scope.messages = $scope.messages.concat(messages);
        });
      };

      $scope.init = function() {
        $scope.ready = false;

        // init variables
        var valid = (isFinite($routeParams.year) && isFinite($routeParams.month) && isFinite($routeParams.day));
        var params = valid ? {
          year: Number($routeParams.year),
          month: Number($routeParams.month) - 1,
          day: Number($routeParams.day)
        } : undefined;

        $scope.messages = [];

        $scope.moment = moment;
        $scope.date = moment(params).startOf('day');
        $scope.next = moment($scope.date).add(1, 'day');
        $scope.prev = moment($scope.date).subtract(1, 'day');

        // init watcher
        $scope.$watch(function() {
          return $scope.date;
        }, function(newDate, oldDate) {
          if (Number(newDate) !== Number(oldDate)) {
            // I don't know why, but calling $location.path() without $timeout occurs redirection to /
            $timeout(function() {
              $location.path(moment(newDate).format('[/messages/]YYYY/MM/DD'));
            }, 1);
          }
        });

        // init data
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
