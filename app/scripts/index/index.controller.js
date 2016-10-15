(function () {

  'use strict';

  angular
    .module('app')
    .controller('IndexCtrl', IndexController);

  /* @ngInject */
  function IndexController($state, loginService, settingsService) {
    let vm = this;

    vm.users = settingsService.users;

    vm.logout = () => {
      loginService.logout();
      $state.go('login');
    };
  }
})();
