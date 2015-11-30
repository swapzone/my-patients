(function () {

  'use strict';

  angular
    .module('app.invoice')
    .controller('invoiceCtrl', ['invoiceService', '$q', '$mdDialog', InvoiceController]);

  function InvoiceController(invoiceService, $q, $mdDialog) {
    var self = this;

  }
})();