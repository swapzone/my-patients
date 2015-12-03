(function () {

  'use strict';

  angular
    .module('app.invoice')
    .controller('invoiceCtrl', ['patientService', 'invoiceService', '$q', InvoiceController]);

  function InvoiceController(patientService, invoiceService, $q) {
    var self = this;

    $scope.openInvoices = [];
    $scope.dueInvoices = [];

    function init() {

    }

  }
})();