(function () {
  'use strict';

  angular
    .module('app.index')
    .config(routerConfig);

  function routerConfig($urlRouterProvider, $stateProvider) {

    $urlRouterProvider.when('/', '/patient/list');

    $stateProvider.state('index', {
      url: '/',
      parent: 'root',
      templateUrl: 'app/templates/index/index.html',
      controller: 'indexCtrl',
      resolve: {
        /* @ngInject */
        users: function loadUsers(settingsService) {
          return settingsService.getUsers();
        }
      }
    });
  }
})();