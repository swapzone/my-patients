(function () {
  'use strict';

  angular
    .module('app.patient')
    .config(routerConfig);

  function routerConfig($stateProvider) {
    $stateProvider.state('patient.edit', {
      url: 'patient/edit?:active',
      templateUrl: 'app/templates/patient/edit/patient-edit.html',
      controller: 'PatientEditController',
      controllerAs: 'vm'
    });
  }
})();