(function (angular) {

  'use strict';

  angular
    .module('app.invoice')
    .controller('InvoicePositionsController', InvoicePositionsController);

  /* @ngInject */
  function InvoicePositionsController($mdDialog, items) {
    const vm = this;

    vm.treatments = items;

    vm.close = function() {
      $mdDialog.hide();
    };
  }
})(window.angular);