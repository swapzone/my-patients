(function () {

    'use strict';

    angular
        .module('app.common')
        .filter('unsafe', function($sce) {

            return function(input) {
                return input.replace('%2F', '/');
            }
        });
})();