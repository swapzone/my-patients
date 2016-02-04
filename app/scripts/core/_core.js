(function() {

  'use strict';

  angular
    .module('app.core', [
      'ui.router',
      'ngMaterial',
      'pascalprecht.translate',
      'ngStorage'
    ])
    .constant('DATABASE_LOCATION', 'data/');
})();