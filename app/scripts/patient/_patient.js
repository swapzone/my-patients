(function () {
  'use strict';

  angular
    .module('app.patient', [])
    .config(routerConfig);

  function routerConfig($stateProvider) {

    $stateProvider.state('patient', {
      abstract: true,
      parent: 'index',
      template: '<div ui-view></div>'
    });

    $stateProvider.state('patient.list', {
      url: 'patient/list',
      templateUrl: 'app/templates/patient/list.html',
      controller: 'patientCtrl'
    });

    $stateProvider.state('patient.details', {
      url: 'patient/details?:active:previousState',
      templateUrl: 'app/templates/patient/detail.html',
      controller: 'patientDetailCtrl'
    });

    $stateProvider.state('patient.edit', {
      url: 'patient/edit?:active',
      templateUrl: 'app/templates/patient/edit.html',
      controller: 'patientDetailCtrl'
    });

    $stateProvider.state('patient.new', {
      url: 'patient/new',
      templateUrl: 'app/templates/patient/new.html',
      controller: 'patientCtrl'
    });
  }
})();