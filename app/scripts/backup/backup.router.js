(function () {
  'use strict';

  angular
    .module('app.backup')
    .config(routerConfig);

  /* @ngInject */
  function routerConfig($stateProvider) {

    $stateProvider.state('backup', {
      url: '/backup',
      parent: 'index',
      templateUrl: 'app/templates/backup/backup.html',
      controller: 'BackupController',
      controllerAs: 'vm'
    });
  }
})();