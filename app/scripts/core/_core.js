(function() {

  'use strict';

  angular
    .module('app.core', [
      'ui.router',
      'ngMaterial',
      'pascalprecht.translate',
      'ngSanitize',
      'ngStorage'
    ])
    .constant('DATABASE_LOCATION', 'data/');
})();