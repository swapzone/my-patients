(function () {
  'use strict';

  angular
    .module('app.invoice', [])
    .constant('INVOICE_TYPE', {
      'open': 1,
      'due': 2,
      'receipt': 3,
      'old': 4
    })
    .config(routerConfig);

  function routerConfig($stateProvider, INVOICE_TYPE) {

    $stateProvider.state('invoice', {
      abstract: true,
      parent: 'index',
      template: '<div ui-view></div>',
      controller: 'invoiceCtrl'
    });

    $stateProvider.state('invoice.list', {
      url: 'invoice/list',
      templateUrl: 'app/templates/invoice/list.html',
      controller: 'invoiceCtrl',
      data: {
        invoiceType: undefined
      }
    });

    $stateProvider.state('invoice.list.open', {
      url: 'invoice/list/open',
      templateUrl: 'app/templates/invoice/list.html',
      controller: 'invoiceCtrl',
      data: {
        invoiceType: INVOICE_TYPE.open
      }
    });

    $stateProvider.state('invoice.list.due', {
      url: 'invoice/list/due',
      templateUrl: 'app/templates/invoice/list.html',
      controller: 'invoiceCtrl',
      data: {
        invoiceType: INVOICE_TYPE.due
      }
    });

    $stateProvider.state('invoice.list.receipt', {
      url: 'invoice/list/receipt',
      templateUrl: 'app/templates/invoice/list.html',
      controller: 'invoiceCtrl',
      data: {
        invoiceType: INVOICE_TYPE.receipt
      }
    });

    $stateProvider.state('invoice.list.old', {
      url: 'invoice/list/old',
      templateUrl: 'app/templates/invoice/list.html',
      controller: 'invoiceCtrl',
      data: {
        invoiceType: INVOICE_TYPE.old
      }
    });

    $stateProvider.state('invoice.details', {
      url: '/invoice/details',
      templateUrl: 'app/templates/invoice/detail.html',
      controller: 'invoiceCtrl'
    });
  }
})();