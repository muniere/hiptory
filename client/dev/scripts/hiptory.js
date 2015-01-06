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
  ]).config(["$locationProvider", "$routeProvider", "$httpProvider", function($locationProvider, $routeProvider, $httpProvider) {
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
  }]).run(["$rootScope", "$location", "hiAuthService", function($rootScope, $location, hiAuthService) {
    $rootScope.$on('$routeChangeStart', function() {
      if ($location.path() !== '/auth' && !hiAuthService.hasTicket()) {
        $location.path('/auth');
      }
    });

    hiAuthService.test().catch(function() {
      $location.path('/auth');
    });
  }]);
})();

(function() {
  'use strict';

  angular.module('hiptory')
    .controller('AuthController', ["$scope", "$location", "$timeout", "$alert", "hiAuthService", function($scope, $location, $timeout, $alert, hiAuthService) {

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
    }]);
})();

(function() {
  'use strict';
  /* global moment */

  angular.module('hiptory')
    .controller('MessageController', ["$scope", "$location", "$timeout", "$routeParams", "$activityIndicator", "hiMessageService", function($scope, $location, $timeout, $routeParams, $activityIndicator, hiMessageService) {

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
    }]);
})();

(function() {
  'use strict';

  angular.module('hiptory')
    .controller('SettingOthersController', ["$scope", "$alert", "$activityIndicator", "hiSettingService", function($scope, $alert, $activityIndicator, hiSettingService) {

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
    }]);
})();

(function() {
  'use strict';

  angular.module('hiptory')
    .controller('SettingRoomsController', ["$scope", "$modal", "$alert", "$activityIndicator", "hiSettingService", function($scope, $modal, $alert, $activityIndicator, hiSettingService) {

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
    }]);
})();

(function() {
  'use strict';

  angular.module('hiptory')
    .service('hiAuthService', ["$cookies", "$resource", function($cookies, $resource) {

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
    }]);
})();

(function() {
  'use strict';

  angular.module('hiptory')
    .service('hiMessageService', ["$resource", function($resource) {

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
    }]);
})();

(function() {
  'use strict';

  angular.module('hiptory')
    .service('hiSettingService', ["$resource", function($resource) {

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
    }]);
})();

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

(function() {
  'use strict';

  angular.module('hiptory')
    .directive('hiNavbar', ["$location", "hiAuthService", function($location, hiAuthService) {
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
    }]);
})();

(function(module) {
  try {
    module = angular.module('hiptory');
  } catch (e) {
    module = angular.module('hiptory', []);
  }
  module.run(['$templateCache', function($templateCache) {
    $templateCache.put('/directives/dashboard.html',
      '<div class="dashboard">\n' +
      '  <div class="list-group">\n' +
      '    <a class="list-group-item" data-ng-class="{ active: (active === \'rooms\') }" href="/settings/rooms">Rooms</a>\n' +
      '    <a class="list-group-item" data-ng-class="{ active: (active === \'others\') }" href="/settings/others">Others</a>\n' +
      '  </div>\n' +
      '</div>\n' +
      '');
  }]);
})();

(function(module) {
  try {
    module = angular.module('hiptory');
  } catch (e) {
    module = angular.module('hiptory', []);
  }
  module.run(['$templateCache', function($templateCache) {
    $templateCache.put('/directives/navbar.html',
      '<nav class="navbar navbar-inverse navbar-fixed-top">\n' +
      '  <div class="container">\n' +
      '    <div class="navbar-header">\n' +
      '      <a class="navbar-brand" href="/">Hiptory</a>\n' +
      '    </div>\n' +
      '    <ul class="nav navbar-nav navbar-right" data-ng-if="hasTicket()">\n' +
      '      <li><a href="/settings">Settings</a></li>\n' +
      '      <li><a href="#" data-ng-click="logout()">Logout</a></li>\n' +
      '    </ul>\n' +
      '  </div>\n' +
      '</nav>\n' +
      '');
  }]);
})();

(function(module) {
  try {
    module = angular.module('hiptory');
  } catch (e) {
    module = angular.module('hiptory', []);
  }
  module.run(['$templateCache', function($templateCache) {
    $templateCache.put('/views/_settings.rooms.add.html',
      '<div class="modal" tabindex="-1" role="dialog">\n' +
      '  <div class="modal-dialog">\n' +
      '    <div class="modal-content">\n' +
      '      <div class="modal-header">\n' +
      '        <button type="button" class="close" data-ng-click="$hide()">&times;</button>\n' +
      '        <h4 class="modal-title">Add New Room</h4>\n' +
      '      </div>\n' +
      '      <div class="modal-body">\n' +
      '        <form class="form-horizontal">\n' +
      '          <div class="form-group">\n' +
      '            <label class="control-label col-md-2">Room ID</label>\n' +
      '\n' +
      '            <div class="col-md-10">\n' +
      '              <input class="form-control" type="text" data-ng-model="binding.room.id">\n' +
      '            </div>\n' +
      '          </div>\n' +
      '        </form>\n' +
      '      </div>\n' +
      '      <div class="modal-footer">\n' +
      '        <button type="button" class="btn btn-default" data-ng-click="$hide()">Cancel</button>\n' +
      '        <button type="submit" class="btn btn-primary" data-ng-click="doAddRoom(binding.room.id)">Add</button>\n' +
      '      </div>\n' +
      '    </div>\n' +
      '  </div>\n' +
      '</div>\n' +
      '');
  }]);
})();

(function(module) {
  try {
    module = angular.module('hiptory');
  } catch (e) {
    module = angular.module('hiptory', []);
  }
  module.run(['$templateCache', function($templateCache) {
    $templateCache.put('/views/_settings.rooms.del.html',
      '<div class="modal" tabindex="-1" role="dialog">\n' +
      '  <div class="modal-dialog">\n' +
      '    <div class="modal-content">\n' +
      '      <div class="modal-header">\n' +
      '        <button type="button" class="close" data-ng-click="$hide()">&times;</button>\n' +
      '        <h4 class="modal-title">Delete Room</h4>\n' +
      '      </div>\n' +
      '      <div class="modal-body">\n' +
      '        <div class="room-delete">Delete Room {{binding.room.name}}. Are you sure??</div>\n' +
      '      </div>\n' +
      '      <div class="modal-footer">\n' +
      '        <button type="button" class="btn btn-default" data-ng-click="$hide()">Cancel</button>\n' +
      '        <button type="submit" class="btn btn-primary" data-ng-click="doDelRoom(binding.room.id)">Delete</button>\n' +
      '      </div>\n' +
      '    </div>\n' +
      '  </div>\n' +
      '</div>\n' +
      '');
  }]);
})();

(function(module) {
  try {
    module = angular.module('hiptory');
  } catch (e) {
    module = angular.module('hiptory', []);
  }
  module.run(['$templateCache', function($templateCache) {
    $templateCache.put('/views/auth.html',
      '<div class="page-auth" data-ng-init="init()">\n' +
      '  <div class="col-lg-offset-6 col-lg-6 col-md-offset-4 col-md-8 auth-form">\n' +
      '    <h2 class="col-md-offset-1">Login</h2>\n' +
      '\n' +
      '    <form class="form-horizontal col-md-offset-1">\n' +
      '      <div class="row">\n' +
      '        <div class="form-group">\n' +
      '          <label class="control-label col-md-2">Token</label>\n' +
      '\n' +
      '          <div class="col-md-10">\n' +
      '            <input class="form-control" type="text" data-ng-model="credentials.token" placeholder="Hipchat API Token">\n' +
      '          </div>\n' +
      '        </div>\n' +
      '      </div>\n' +
      '      <div class="row">\n' +
      '        <div class="form-group">\n' +
      '          <div class="col-md-10 col-md-offset-2">\n' +
      '            <button class="btn btn-primary" type="submit" data-ng-click="login()">submit</button>\n' +
      '          </div>\n' +
      '        </div>\n' +
      '      </div>\n' +
      '    </form>\n' +
      '  </div>\n' +
      '</div>\n' +
      '');
  }]);
})();

(function(module) {
  try {
    module = angular.module('hiptory');
  } catch (e) {
    module = angular.module('hiptory', []);
  }
  module.run(['$templateCache', function($templateCache) {
    $templateCache.put('/views/messages.html',
      '<div class="page-message" data-ng-init="init()">\n' +
      '  <div class="pager-fixed">\n' +
      '    <div class="container">\n' +
      '      <ul class="pager">\n' +
      '        <li class="previous">\n' +
      '          <a data-ng-href="/messages/{{moment(prev).format(\'YYYY/MM/DD\')}}">\n' +
      '            &larr; {{moment(prev).format(\'YYYY/MM/DD\')}}</a>\n' +
      '        </li>\n' +
      '        <li class="current">\n' +
      '          <a href="#" class="btn-link" data-ng-model="date" data-date-format="yyyy/MM/dd" bs-datepicker>\n' +
      '            {{moment(date).format(\'YYYY/MM/DD\')}} <span class="glyphicon glyphicon-calendar"></span>\n' +
      '          </a>\n' +
      '        </li>\n' +
      '        <li class="next">\n' +
      '          <a data-ng-href="/messages/{{moment(next).format(\'YYYY/MM/DD\')}}">\n' +
      '            {{moment(next).format(\'YYYY/MM/DD\')}} &rarr;\n' +
      '          </a>\n' +
      '        </li>\n' +
      '      </ul>\n' +
      '    </div>\n' +
      '  </div>\n' +
      '\n' +
      '  <div class="content-fixed">\n' +
      '    <table class="table messages" data-ng-if="ready && messages.length > 0">\n' +
      '      <tr class="message-row" data-ng-repeat="message in messages">\n' +
      '        <td class="message-room">{{message.roomName}}</td>\n' +
      '        <td class="message-time">{{message.time}}</td>\n' +
      '        <td class="message-body" data-ng-bind-html="message.body"></td>\n' +
      '      </tr>\n' +
      '    </table>\n' +
      '    <div class="no-messages" data-ng-if="ready && messages.length <= 0">\n' +
      '      <div class="panel panel-info">\n' +
      '        <div class="panel-heading">\n' +
      '          <h3 class="panel-title">Information</h3>\n' +
      '        </div>\n' +
      '        <div class="panel-body">No messages found</div>\n' +
      '      </div>\n' +
      '    </div>\n' +
      '    <div class="some-errors" data-ng-if="error">\n' +
      '      <div class="panel panel-danger">\n' +
      '        <div class="panel-heading">\n' +
      '          <h3 class="panel-title">Error</h3>\n' +
      '        </div>\n' +
      '        <div class="panel-body">Some error occurred</div>\n' +
      '      </div>\n' +
      '    </div>\n' +
      '    <div data-ng-activity-indicator="CircledDark" data-ng-if="!ready && !error"></div>\n' +
      '  </div>\n' +
      '</div>\n' +
      '');
  }]);
})();

(function(module) {
  try {
    module = angular.module('hiptory');
  } catch (e) {
    module = angular.module('hiptory', []);
  }
  module.run(['$templateCache', function($templateCache) {
    $templateCache.put('/views/settings.others.html',
      '<div class="page-settings" data-ng-init="init()">\n' +
      '  <div class="col-md-3 dashboard">\n' +
      '    <hi-dashboard active="others"></hi-dashboard>\n' +
      '  </div>\n' +
      '  <div class="col-md-9 settings">\n' +
      '    <h2 class="pull-left">Others</h2>\n' +
      '\n' +
      '    <div class="clearfix"></div>\n' +
      '\n' +
      '    <form class="form-horizontal" data-ng-if="ready">\n' +
      '      <div class="form-group">\n' +
      '        <label class="control-label col-md-2">Notification</label>\n' +
      '\n' +
      '        <div class="col-md-10 checkbox">\n' +
      '          <label>\n' +
      '            <input type="checkbox" value="true"\n' +
      '                   data-ng-model="settings.notification"\n' +
      '                   data-ng-checked="settings.notification">Include notification messages (from github, jenkins, etc.)\n' +
      '          </label>\n' +
      '        </div>\n' +
      '      </div>\n' +
      '      <div class="form-group">\n' +
      '        <div class="col-md-offset-2 col-md-10">\n' +
      '          <button class="btn btn-primary" type="submit" data-ng-click="update()">update</button>\n' +
      '        </div>\n' +
      '      </div>\n' +
      '    </form>\n' +
      '    <div class="some-errors" data-ng-if="error">\n' +
      '      <div class="panel panel-danger">\n' +
      '        <div class="panel-heading">\n' +
      '          <h3 class="panel-title">Error</h3>\n' +
      '        </div>\n' +
      '        <div class="panel-body">Some error occurred</div>\n' +
      '      </div>\n' +
      '    </div>\n' +
      '    <div data-ng-activity-indicator="CircledDark" data-ng-if="!ready && !error"></div>\n' +
      '  </div>\n' +
      '</div>\n' +
      '');
  }]);
})();

(function(module) {
  try {
    module = angular.module('hiptory');
  } catch (e) {
    module = angular.module('hiptory', []);
  }
  module.run(['$templateCache', function($templateCache) {
    $templateCache.put('/views/settings.rooms.html',
      '<div class="page-settings" data-ng-init="init()">\n' +
      '  <div class="col-md-3 dashboard">\n' +
      '    <hi-dashboard active="rooms"></hi-dashboard>\n' +
      '  </div>\n' +
      '  <div class="col-md-9 settings">\n' +
      '    <h2 class="pull-left">Rooms</h2>\n' +
      '\n' +
      '    <button class="btn btn-info btn-lhead" data-ng-click="addRoom()">New Room</button>\n' +
      '\n' +
      '    <div class="clearfix"></div>\n' +
      '\n' +
      '    <div class="room-settings" data-ng-if="ready && (rooms && rooms.length > 0)">\n' +
      '      <div class="row room-head">\n' +
      '        <div class="col-md-1 room-number"><strong>#</strong></div>\n' +
      '        <div class="col-md-2 room-id"><strong>ID</strong></div>\n' +
      '        <div class="col-md-8 room-name"><strong>Name</strong></div>\n' +
      '        <div class="col-md-1 room-action"><strong>Action</strong></div>\n' +
      '      </div>\n' +
      '      <div class="row room-body" data-ng-repeat="room in rooms track by $index">\n' +
      '        <div class="col-md-1 room-number">{{$index + 1}}</div>\n' +
      '        <div class="col-md-2 room-id">{{room.id}}</div>\n' +
      '        <div class="col-md-8 room-name">{{room.name}}</div>\n' +
      '        <div class="col-md-1 room-action"><a href="#" data-ng-click="delRoom(room)">delete</a></div>\n' +
      '      </div>\n' +
      '    </div>\n' +
      '    <div class="no-rooms" data-ng-if="ready && (!rooms || rooms.length <= 0)">\n' +
      '      <div class="panel panel-info">\n' +
      '        <div class="panel-heading">\n' +
      '          <h3 class="panel-title">Information</h3>\n' +
      '        </div>\n' +
      '        <div class="panel-body">No rooms configured</div>\n' +
      '      </div>\n' +
      '    </div>\n' +
      '    <div class="some-errors" data-ng-if="error">\n' +
      '      <div class="panel panel-danger">\n' +
      '        <div class="panel-heading">\n' +
      '          <h3 class="panel-title">Error</h3>\n' +
      '        </div>\n' +
      '        <div class="panel-body">Some error occurred</div>\n' +
      '      </div>\n' +
      '    </div>\n' +
      '    <div data-ng-activity-indicator="CircledDark" data-ng-if="!ready && !error"></div>\n' +
      '  </div>\n' +
      '</div>\n' +
      '');
  }]);
})();
