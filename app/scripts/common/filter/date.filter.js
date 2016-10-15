(function () {

  'use strict';

  angular
    .module('app.common')
    .filter('dateFilter', function () {

      return function (input) {
        if(!input)
          return '';

        var date = new Date(input);

        var day = date.getDate();
        if (day < 10) {
          day = '0' + day;
        }

        var month = date.getMonth() + 1;
        if (month < 10) {
          month = '0' + month;
        }

        return day + '.' + month + '.' + date.getFullYear();
      };
    });
})();