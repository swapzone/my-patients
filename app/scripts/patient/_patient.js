(function () {
  'use strict';

  angular
    .module('app.patient', [
      'app.core'
    ])
    .config(routerConfig);

  function routerConfig($stateProvider) {

    $stateProvider.state('patient', {
      url: '/patients',
      parent: 'index',
      templateUrl: 'app/scripts/templates/patient/list.html',
      controller: 'patientCtrl'
    });

    $stateProvider.state('patient.details', {
      url: '/patient',
      templateUrl: 'app/scripts/templates/patient/detail.html',
      controller: 'patientCtrl'
    });
  }
})();