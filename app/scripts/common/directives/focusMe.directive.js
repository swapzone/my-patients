(function () {

  'use strict';

  angular
    .module('app.common')
    .directive('focusMe', function ($timeout, $parse) {
      return {
        link: function (scope, element, attrs) {
          scope.$watch(attrs.focusMe, function(value) {
            var model = $parse(attrs.focusMe);

            if(value === true) {
              $timeout(function() {
                element[0].focus();
              }, 800);

              element.bind("keydown keypress", function (event) {
                if(event.which === 27) {
                  scope.$apply(model.assign(scope, false));
                  event.preventDefault();
                }
              });
            }
          });
        }
      };
    });
})();