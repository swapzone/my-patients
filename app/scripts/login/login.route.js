(function () {
  'use strict';

  angular
    .module('app.login')
    .config(routerConfig);

  function routerConfig($stateProvider) {

    $stateProvider.state('login', {
      url: '/login',
      parent: 'root',
      templateUrl: 'app/templates/login/login.html',
      controller: 'LoginCtrl',
      controllerAs: 'vm',
      resolve: {
        /* @ngInject */
        users: function loadUsers(settingsService) {
          return settingsService.getUsers();
      }
    }
    });
  }
})();