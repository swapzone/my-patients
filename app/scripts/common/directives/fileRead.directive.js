(function () {

  'use strict';

  angular
    .module('app.common')
    .directive('fileRead', fileReadDirective);

  /* @ngInject */
  function fileReadDirective() {
    return {
      scope: {
        fileRead: "="
      },
      link: function (scope, element, attributes) {
        element.bind("change", function (changeEvent) {
          var reader = new FileReader();

          reader.onload = function (loadEvent) {
            scope.$apply(function () {
              scope.fileRead = loadEvent.target.result;
            });
          };

          reader.readAsBinaryString(changeEvent.target.files[0]);
        });
      }
    }
  }
})();