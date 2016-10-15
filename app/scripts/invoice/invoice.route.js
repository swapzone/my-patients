(function () {
  'use strict';

  angular
    .module('app.invoice')
    .config(routerConfig);

  /* @ngInject */
  function routerConfig($stateProvider) {
    $stateProvider.state('invoice', {
      url: 'invoice?:type',
      parent: 'index',
      templateUrl: 'app/templates/invoice/invoice.html',
      controller: 'InvoiceController',
      controllerAs: 'vm'
    });
  }
})();