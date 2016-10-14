(function() {

  'use strict';

  angular
    .module('app.core', [
      'ui.router',
      'ngMaterial',
      'ngStorage'
    ])
    .constant('DATABASE_LOCATION', 'data/');
})();