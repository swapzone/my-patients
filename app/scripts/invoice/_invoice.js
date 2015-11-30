(function () {
  'use strict';

  angular
    .module('app.invoice', [
      'app.core'
    ])
    .config(routerConfig);

  function routerConfig($stateProvider) {

    $stateProvider.state('invoice', {
      url: '/invoices',
      parent: 'index',
      templateUrl: 'app/scripts/templates/invoice/list.html',
      controller: 'invoiceCtrl'
    });

    $stateProvider.state('invoice.details', {
      url: '/invoice',
      templateUrl: 'app/scripts/templates/invoice/detail.html',
      controller: 'invoiceCtrl'
    });
  }
})();