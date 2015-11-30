(function () {
  'use strict';

  angular
    .module('app.settings', [
      'app.core'
    ])
    .config(routerConfig);

  function routerConfig($stateProvider) {

    $stateProvider.state('settings', {
      url: '/settings',
      parent: 'root',
      templateUrl: 'app/scripts/templates/settings/settings.html',
      controller: 'settingsCtrl'
    });
  }
})();