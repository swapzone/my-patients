(function () {
  'use strict';

  angular
    .module('app.index', [])
    .config(routerConfig);

  function routerConfig($stateProvider) {

    $stateProvider.state('index', {
      url: '/',
      parent: 'root',
      templateUrl: 'app/templates/index/index.html',
      controller: 'indexCtrl',
      resolve: {
        users: loadUsers
      }
    });
  }

  function loadUsers(settingsService) {
    return settingsService.getUsers();
  }
})();