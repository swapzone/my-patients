(function () {
  'use strict';

  angular
    .module('app.patient')
    .config(routerConfig);

  function routerConfig($stateProvider) {
    $stateProvider.state('patient', {
      abstract: true,
      parent: 'index',
      template: '<div ui-view></div>'
    });

    $stateProvider.state('patient.list', {
      url: 'patient/list',
      templateUrl: 'app/templates/patient/patient.html',
      controller: 'PatientController',
      controllerAs: 'vm'
    });
  }
})();