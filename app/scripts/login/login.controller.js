(function () {

  'use strict';

  angular
    .module('app.login')
    .controller('LoginCtrl', LoginController);

  /* @ngInject */
  function LoginController($state, loginService, settingsService) {
    let vm = this;

    /**
     * Set given user as active user.
     *
     * @param user
     */
    let login = (user) => {
      loginService.login(user);
      $state.go('patient.list');
    };

    vm.$onInit = () => {
      vm.users = settingsService.users;

      if (settingsService.users.length === 1) {
        login(settingsService.users[0]);
      }
    };

    //
    // Controller API
    //
    vm.login = login;
  }
})();