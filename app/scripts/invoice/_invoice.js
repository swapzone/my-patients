(function () {
  'use strict';

  angular
    .module('app.invoice', [])
    .config(routerConfig);

  function routerConfig($stateProvider) {

    $stateProvider.state('invoice', {
      abstract: true,
      parent: 'index',
      template: '<div ui-view></div>',
      controller: 'invoiceCtrl'
    });

    $stateProvider.state('invoice.list', {
      url: 'invoice/list?:parameter',
      templateUrl: 'app/scripts/templates/invoice/list.html',
      controller: 'invoiceCtrl'
    });

    $stateProvider.state('invoice.details', {
      url: '/invoice/details',
      templateUrl: 'app/scripts/templates/invoice/detail.html',
      controller: 'invoiceCtrl'
    });
  }
})();