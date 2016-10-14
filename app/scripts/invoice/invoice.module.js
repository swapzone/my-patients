(function () {
  'use strict';

  angular
    .module('app.invoice', [
      'ngMaterial',
      'ui.router',
      'app.common',
      'app.patient',
      'app.settings'
    ])
    .constant('INVOICE_TYPE', {
      'open': 1,
      'due': 2,
      'receipt': 3,
      'old': 4
    });
})();