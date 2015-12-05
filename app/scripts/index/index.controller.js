(function () {

  'use strict';

  angular
    .module('app')
    .controller('indexCtrl', ['$rootScope', 'users', IndexController]);

  function IndexController($rootScope, users) {
    $rootScope.users = users;
  }
})();