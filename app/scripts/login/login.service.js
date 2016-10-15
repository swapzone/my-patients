(function () {

  'use strict';

  angular
    .module('app.login')
    .service('loginService', loginService);

  /* @ngInject */
  function loginService($sessionStorage) {
    let service = this;

    /**
     * Returns the current user or undefined if no user was selected.
     *
     * @returns {string}
     */
    let activeUser = () => {
      if (!service.user) {
        service.user = $sessionStorage['activeUser'];
      }
      return service.user;
    };

    /**
     * Set given user active.
     *
     * @param user
     */
    let login = (user) => {
      $sessionStorage['activeUser'] = user;

      service.user = user;
    };

    /**
     * Unset active user.
     */
    let logout = () => {
      delete $sessionStorage['activeUser'];
      delete $sessionStorage['newPatient'];

      service.user = undefined;
    };

    //
    // Service API
    //
    service.activeUser = activeUser;
    service.login = login;
    service.logout = logout;
  }
})();