(function () {
  'use strict';

  angular
    .module('app', [
      'app.index',
      'app.patient',
      'app.invoice',
      'app.settings',
      'app.templates'
    ])
    .config(routeConfig);

  function routeConfig($stateProvider, $urlRouterProvider) {

    $urlRouterProvider.otherwise("/");

    $stateProvider.state('root', {
      abstract: true,
      template: '<div ui-view></div>',
      resolve: {
        appData: loadData
      }
    });
  }

  function loadData() {
    return {};
  }
})();