(function () {
  'use strict';

  angular
    .module('app.patient')
    .config(routerConfig);

  function routerConfig($stateProvider) {

    $stateProvider.state('patient.details', {
      url: 'patient/details?:active:previousState',
      templateUrl: 'app/templates/patient/detail.html',
      controller: 'PatientDetailController',
      controllerAs: 'vm'
    });
  }
})();