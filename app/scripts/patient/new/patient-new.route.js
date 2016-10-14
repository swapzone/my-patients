(function () {
  'use strict';

  angular
    .module('app.patient')
    .config(routerConfig);

  function routerConfig($stateProvider) {
    $stateProvider.state('patient.new', {
      url: 'patient/new',
      templateUrl: 'app/templates/patient/new/patient-new.html',
      controller: 'PatientNewController',
      controllerAs: 'vm'
    });
  }
})();