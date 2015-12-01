(function() {

  'use strict';

  angular
    .module('app.core', [
      'ui.router',
      'ngMaterial',
      'pascalprecht.translate'
    ])
    .constant('DATABASE_LOCATION', 'data/');
})();