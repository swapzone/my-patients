(function () {

  'use strict';

  angular
    .module('app.common')
    .directive("autoComplete", [function () {

      return {
        restrict: 'E',
        replace: true,
        template:
        "<span>" +
          "<input type='text' ng-keyup='getSuggestions($event, model.postal)' ng-model='model.postal' />" +
          "<ul class='dropdown' ng-if='suggestions && suggestions.length'>" +
            "<li ng-repeat='suggestion in suggestions'" +
                "ng-click='selectSuggestion(suggestion)'" +
                "ng-class='{ active: suggestion == activeSuggestion }'>{{ suggestion.code }} {{ suggestion.city }}</li>" +
          "</ul>" +
        "</span>",
        scope: {
          model: "=",
          retrieveSuggestionsFn: "&"
        },
        link: link
      };

      function link(scope, element, attributes) {
        
        scope.getSuggestions = getSuggestions;
        scope.selectSuggestion = selectSuggestion;

        /**
         *
         *
         * @param event
         * @param input
         */
        function getSuggestions(event, input) {

          if(input.length < 3) {
            scope.suggestions = [];
            return;
          }

          switch(event.keyCode) {
            case 13: // enter
              if(scope.activeSuggestion) {
                selectSuggestion(scope.activeSuggestion);
              }
              scope.suggestions = [];
              break;
            case 27: // escape
              scope.suggestions = [];
              break;
            case 38: // arrow up
              if(scope.suggestions && scope.suggestions.length) {
                if(scope.activeSuggestion) {
                  var newIndex = scope.suggestions.indexOf(scope.activeSuggestion) - 1;
                  if(newIndex < 0) newIndex = scope.suggestions.length - 1;

                  scope.activeSuggestion = scope.suggestions[newIndex];
                }
                else {
                  scope.activeSuggestion = scope.suggestions[0];
                }
              }
              break;
            case 40: // arrow down
              if(scope.suggestions && scope.suggestions.length) {
                if(scope.activeSuggestion) {
                  var newIndex = scope.suggestions.indexOf(scope.activeSuggestion) + 1;
                  if(newIndex > scope.suggestions.length - 1) newIndex = 0;

                  scope.activeSuggestion = scope.suggestions[newIndex];
                }
                else {
                  scope.activeSuggestion = scope.suggestions[0];
                }
              }
              break;
            default:
              scope.retrieveSuggestionsFn({ input: input })
                .then(function(results) {
                  scope.suggestions = results.map(function(result) {
                    return result;
                  })
                });
              break;
          }
        }

        /**
         *
         *
         * @param suggestion
         */
        function selectSuggestion(suggestion) {
          scope.model.postal = suggestion.code;
          scope.model.city = suggestion.city;

          scope.suggestions = [];
        }
      }
    }]);
})();