(function () {
  'use strict';

  angular
    .module('app.patient')
    .config(routerConfig);

  function routerConfig($stateProvider) {

    $stateProvider.state('patient.details', {
      url: 'patient/details?:patientId:previousState',
      templateUrl: 'app/templates/patient/detail/patient-detail.html',
      controller: 'PatientDetailController',
      controllerAs: 'vm'
    });
  }
})();