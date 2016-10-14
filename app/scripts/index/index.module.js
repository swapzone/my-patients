(function () {
  'use strict';

  angular
    .module('app.index', [
      'ui.router',
      'app.patient',
      'app.invoice',
      'app.backup',
      'app.settings',
      'app.login',
      'app.templates'
    ]);
})();