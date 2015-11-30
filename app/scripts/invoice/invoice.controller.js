(function () {

  'use strict';

  angular
    .module('app.invoice')
    .controller('invoiceCtrl', ['invoiceService', '$q', InvoiceController]);

  function InvoiceController(invoiceService, $q) {
    var self = this;

  }
})();