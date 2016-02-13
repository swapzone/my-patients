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
    .constant('INSURANCE_TYPE', {
      'state': 'Gesetzlich',
      'private': 'Privat',
      'privatePlus': 'Privat Zusatz'
    })
    .config(routeConfig);

  function routeConfig($urlRouterProvider, $stateProvider) {

    $urlRouterProvider.when('/', '/patient/list');
    $urlRouterProvider.otherwise('/patient/list');

    $stateProvider.state('root', {
      abstract: true,
      template: '<div ui-view></div>'
    });
  }
})();