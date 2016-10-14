(function () {
  'use strict';

  angular
    .module('app')
    .config(routeConfig);

  /* @ngInject */
  function routeConfig($urlRouterProvider, $stateProvider) {
    $urlRouterProvider.when('/', '/patient/list');
    $urlRouterProvider.otherwise('/patient/list');

    $stateProvider.state('root', {
      abstract: true,
      template: '<div ui-view></div>'
    });
  }
})();