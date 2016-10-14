(function () {

  'use strict';

  angular
    .module('app')
    .controller('IndexCtrl', IndexController);

  /* @ngInject */
  function IndexController($state, loginService) {
    let vm = this;

    vm.logout = () => {
      loginService.logout();
      $state.go('login');
    };
  }
})();