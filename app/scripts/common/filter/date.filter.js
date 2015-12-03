(function () {

  'use strict';

  angular
    .module('app.common')
    .filter('dateFilter', function () {

      return function (input) {
        if(!input)
          return "";

        var date = new Date(input);
        var month = date.getMonth() + 1;
        return date.getDate() + "." + month + "." + date.getFullYear();
      };
    });
})();