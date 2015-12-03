(function () {
  'use strict';

  angular
    .module('app.settings', [])
    .config(routerConfig);

  function routerConfig($stateProvider) {

    $stateProvider.state('settings', {
      url: '/settings',
      parent: 'index',
      templateUrl: 'app/scripts/templates/settings/settings.html',
      controller: 'settingsCtrl'
    });
  }
})();