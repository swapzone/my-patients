(function () {
  'use strict';

  angular
    .module('app.index', [])
    .config(routerConfig);

  function routerConfig($stateProvider) {

    $stateProvider.state('index', {
      url: '/',
      parent: 'root',
      templateUrl: 'app/scripts/templates/index/index.html',
      controller: 'indexCtrl'
    });
  }
})();