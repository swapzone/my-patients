(function () {

  'use strict';

  angular
    .module('app')
    .controller('indexCtrl', ['$rootScope', 'users', 'settingsService', IndexController]);

  function IndexController($rootScope, users, settingsService) {
    $rootScope.users = users;

    $rootScope.$on('userChanged', function() {
      settingsService.getUsers()
        .then(function(users) {
          $rootScope.users = users;
        });
    });
  }
})();