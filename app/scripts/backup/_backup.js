(function () {
  'use strict';

  angular
    .module('app.backup', [])
    .config(routerConfig);

  function routerConfig($stateProvider) {

    $stateProvider.state('backup', {
      url: '/backup',
      parent: 'index',
      templateUrl: 'app/scripts/templates/backup/backup.html',
      controller: 'backupCtrl'
    });
  }
})();