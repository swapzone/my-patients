(function () {
  'use strict';

  angular
    .module('app', [
      'ui.router',
      'app.index',
      'app.login'
    ])
    .constant('INSURANCE_TYPE', {
      'state': 'Gesetzlich',
      'private': 'Privat',
      'privatePlus': 'Privat Zusatz'
    })
    .constant('DATABASE_LOCATION', 'data/');
})();