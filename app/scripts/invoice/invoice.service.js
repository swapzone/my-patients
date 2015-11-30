(function () {

  'use strict';

  // Create NeDB database connection
  var connection;

  angular
    .module('app.invoice')
    .service('invoiceService', ['$q', InvoiceService]);

  function InvoiceService($q) {

    return {
      get: function() {
        return 1;
      }
    }
  }
})();