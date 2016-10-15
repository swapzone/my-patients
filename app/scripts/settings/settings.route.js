(function () {
  'use strict';

  angular
    .module('app.settings')
    .config(routerConfig);

  /* @ngInject */
  function routerConfig($stateProvider) {

    $stateProvider.state('settings', {
      url: '/settings',
      parent: 'index',
      templateUrl: 'app/templates/settings/settings.html',
      controller: 'SettingsController',
      controllerAs: 'vm'
    });
  }
})();