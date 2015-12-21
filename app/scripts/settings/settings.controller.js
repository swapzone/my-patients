(function () {

  'use strict';

  angular
    .module('app.settings')
    .controller('settingsCtrl', ['$rootScope', '$scope', 'settingsService', '$mdDialog', SettingsController]);

  function SettingsController($rootScope, $scope, settingsService, $mdDialog) {
    $scope.users = [];
    $scope.invoiceTemplates = [];
    $scope.settings = {}; // used to store languages

    $scope.addUser = addUser;
    $scope.deleteUser = deleteUser;
    $scope.addTemplate = addTemplate;
    $scope.deleteTemplate = deleteTemplate;

    loadUsers();
    loadInvoiceTemplates();

    $rootScope.$on('userChanged', function() {
      loadUsers();
    });

    function loadUsers() {
      settingsService.getUsers()
        .then(function(users) {
          $scope.users = users;
        });
    }

    function loadInvoiceTemplates() {
      settingsService.getInvoiceTemplates()
        .then(function(templates) {
          $scope.invoiceTemplates = templates;
        });
    }

    /**
     *
     *
     * @param $event
     */
    function addUser($event) {

      var dialogObject = {
        controller: function() {
          $scope.newUser = {};

          $scope.abort = function() {
            $mdDialog.cancel();
          };

          $scope.saveUser = function() {

            if ($scope.newUser['name']) {
              settingsService.addUser($scope.newUser).then(function () {
                $scope.newUser = {};
                $scope.error = "";

                $rootScope.$broadcast('userChanged', {});
                $mdDialog.cancel();
              }, function(err) {
                $scope.error("Der neue Nutzer konnte nicht hinzugefügt werden. Ist der Nutzername schon vergeben?");
                console.error(err);
              });
            }
            else {
              $scope.error = "Es muss ein Nutzername vergeben werden!";
            }
          };
        },
        scope: $scope.$new(),
        templateUrl: 'app/templates/settings/user.html',
        parent: angular.element(document.body),
        targetEvent: $event,
        clickOutsideToClose:true
      };

      $mdDialog.show(dialogObject)
        .finally(function() {
          dialogObject = undefined;
        });
    }

    /**
     *
     *
     * @param $event
     * @param id
     */
    function deleteUser($event, id) {

      var confirm = $mdDialog.confirm()
        .parent(angular.element(document.body))
        .title('Sicher?')
        .content('Willst du den Nutzer wirklich löschen?')
        .targetEvent($event)
        .ok('Ja')
        .cancel('Oh. Nein!');

      $mdDialog.show(confirm).then(function() {
        settingsService.deleteUser(id);

        $rootScope.$broadcast('userChanged', {});
      }, function() { });
    }

    /**
     *
     *
     * @param $event
     */
    function addTemplate($event) {

      var dialogObject = {
        controller: function() {
          $scope.newTemplate = {};

          $scope.abort = function() {
            $mdDialog.cancel();
          };

          $scope.saveTemplate = function() {

            if ($scope.newTemplate['name'] && $scope.newTemplate['file']) {
              settingsService.addInvoiceTemplate($scope.newTemplate).then(function () {
                $scope.newTemplate = {};
                $scope.error = "";
                loadInvoiceTemplates();
                $mdDialog.cancel();
              }, function(err) {
                $scope.error("Die neue Rechnungsvorlage konnte nicht hinzugefügt werden. Ist der Name schon vergeben?");
                console.error(err);
              });
            }
            else {
              $scope.error = "Es muss ein Vorlagennamen vergeben und ein Worddokument ausgewählt werden!";
            }
          };
        },
        scope: $scope.$new(),
        templateUrl: 'app/templates/settings/template.html',
        parent: angular.element(document.body),
        targetEvent: $event,
        clickOutsideToClose: true
      };

      $mdDialog.show(dialogObject)
        .finally(function() {
          dialogObject = undefined;
        });
    }

    /**
     *
     *
     * @param $event
     * @param id
     */
    function deleteTemplate($event, id) {

      var confirm = $mdDialog.confirm()
        .parent(angular.element(document.body))
        .title('Sicher?')
        .content('Willst du die Rechnungsvorlage wirklich löschen?')
        .targetEvent($event)
        .ok('Ja')
        .cancel('Oh. Nein!');

      $mdDialog.show(confirm).then(function() {
        settingsService.deleteInvoiceTemplate(id);
        loadInvoiceTemplates();
      }, function() { });
    }
  }
})();