(function () {
  'use strict';

  angular
    .module('app.invoice')
    .config(routerConfig);

  /* @ngInject */
  function routerConfig($stateProvider, INVOICE_TYPE) {

    $stateProvider.state('invoice', {
      abstract: true,
      parent: 'index',
      template: '<div ui-view></div>',
      controller: 'InvoiceCtrl'
    });

    $stateProvider.state('invoice.list', {
      url: 'invoice/list',
      templateUrl: 'app/templates/invoice/list.html',
      controller: 'InvoiceCtrl',
      controllerAs: 'vm',
      data: {
        invoiceType: undefined
      }
    });

    $stateProvider.state('invoice.list.open', {
      url: 'invoice/list/open',
      templateUrl: 'app/templates/invoice/list.html',
      controller: 'InvoiceCtrl',
      controllerAs: 'vm',
      data: {
        invoiceType: INVOICE_TYPE.open
      }
    });

    $stateProvider.state('invoice.list.due', {
      url: 'invoice/list/due',
      templateUrl: 'app/templates/invoice/list.html',
      controller: 'InvoiceCtrl',
      controllerAs: 'vm',
      data: {
        invoiceType: INVOICE_TYPE.due
      }
    });

    $stateProvider.state('invoice.list.receipt', {
      url: 'invoice/list/receipt',
      templateUrl: 'app/templates/invoice/list.html',
      controller: 'InvoiceCtrl',
      controllerAs: 'vm',
      data: {
        invoiceType: INVOICE_TYPE.receipt
      }
    });

    $stateProvider.state('invoice.list.old', {
      url: 'invoice/list/old',
      templateUrl: 'app/templates/invoice/list.html',
      controller: 'InvoiceCtrl',
      controllerAs: 'vm',
      data: {
        invoiceType: INVOICE_TYPE.old
      }
    });

    $stateProvider.state('invoice.details', {
      url: '/invoice/details',
      templateUrl: 'app/templates/invoice/detail.html',
      controller: 'invoiceCtrl',
      controllerAs: 'vm'
    });
  }
})();