(function () {
  'use strict';

  angular
    .module('app', [
      'app.common',
      'app.core',
      'app.index',
      'app.patient',
      'app.invoice',
      'app.backup',
      'app.settings',
      'app.templates'
    ])
    .value('users', [])
    .config(routeConfig);

  function routeConfig($stateProvider, $urlRouterProvider) {

    $urlRouterProvider.otherwise("/patient/list");

    $stateProvider.state('root', {
      abstract: true,
      template: '<div ui-view></div>',
      resolve: {
        appData: loadData
      }
    });
  }

  function loadData($q) {
    // for testing purposes only
  }
})();