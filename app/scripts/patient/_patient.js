(function () {
  'use strict';

  angular
    .module('app.patient', [
      'app.core'
    ])
    .config(routerConfig);

  function routerConfig($stateProvider) {

    $stateProvider.state('patient', {
      abstract: true,
      parent: 'index',
      template: '<div ui-view></div>',
      controller: 'patientCtrl'
    });

    $stateProvider.state('patient.list', {
      url: 'patient/list',
      templateUrl: 'app/scripts/templates/patient/list.html',
      controller: 'patientCtrl'
    });

    $stateProvider.state('patient.details', {
      url: 'patient/details',
      templateUrl: 'app/scripts/templates/patient/detail.html',
      controller: 'patientCtrl'
    });
  }
})();