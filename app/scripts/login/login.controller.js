(function () {

  'use strict';

  angular
    .module('app.login')
    .controller('LoginCtrl', LoginController);

  /* @ngInject */
  function LoginController($rootScope, $state, loginService, users) {
    let vm = this;

    /**
     * Set given user as active user.
     *
     * @param user
     */
    let login = (user) => {
      loginService.login(user);
      $rootScope.user = user;
      $state.go('patient.list');
    };

    vm.$onInit = () => {
      vm.users = users;

      if (users.length === 1) {
        login(users[0]);
      }
    };

    //
    // Controller API
    //
    vm.login = login;
  }
})();