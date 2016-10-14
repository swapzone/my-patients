(function () {
  'use strict';

  angular
    .module('app')
    .config(routeConfig)
    .run(run);

  /* @ngInject */
  function routeConfig($urlRouterProvider, $stateProvider) {
    $urlRouterProvider.when('/', '/patient/list');
    $urlRouterProvider.otherwise('/patient/list');

    $stateProvider.state('root', {
      abstract: true,
      template: '<div ui-view></div>'
    });
  }

  /* @ngInject */
  function run($rootScope, $state, loginService) {

    if (loginService.activeUser()) {
      $rootScope.user = loginService.activeUser();
    }

    $rootScope.$on('$stateChangeStart',
      function (event, toState, toParams, fromState, fromParams) {

        // prevent user from going to the login page if the user is already authenticated
        if (!$rootScope.user && toState.name !== 'login') {
          event.preventDefault();
          $state.go('login');
        }
      });
  }
})();