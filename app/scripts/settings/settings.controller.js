(function () {

  'use strict';

  angular
    .module('app.settings')
    .controller('SettingsController', SettingsController);

  /* @ngInject */
  function SettingsController($log, $mdDialog, $scope, settingsService, loginService) {
    const vm = this;

    vm.users = settingsService.users;
    vm.currentUser = loginService.activeUser();
    vm.invoiceTemplates = [];

    vm.$onInit = () => {
      settingsService.getInvoiceTemplates()
        .then(function(templates) {
          vm.invoiceTemplates = templates.filter((template => template.user === vm.currentUser._id));
        });
    };

    /**
     * Add a new user to the database.
     *
     * @param $event
     */
    let addUser = ($event) => {
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
        templateUrl: 'app/templates/settings/modals/user.html',
        parent: angular.element(document.body),
        targetEvent: $event,
        clickOutsideToClose:true
      };

      $mdDialog.show(dialogObject)
        .finally(function() {
          dialogObject = undefined;
        });
    };

    /**
     * Delete a user from the database.
     *
     * @param $event
     * @param id
     */
    let deleteUser = ($event, id) => {

      var confirm = $mdDialog.confirm()
        .parent(angular.element(document.body))
        .title('Sicher?')
        .content('Willst du den Nutzer wirklich löschen?')
        .targetEvent($event)
        .ok('Ja')
        .cancel('Oh. Nein!');

      $mdDialog.show(confirm).then(function() {
        settingsService.deleteUser(id)
          .then(() => {
            $log.debug('User was deleted.');
          });
      }, function() { });
    };

    /**
     * Open the add template dialog.
     *
     * @param $event
     */
    let addTemplate = ($event) => {
      let dialogObject = {
        controller: function() {
          $scope.newTemplate = {};

          $scope.abort = function() {
            $mdDialog.cancel();
          };

          $scope.saveTemplate = function() {
            if ($scope.newTemplate['name'] && $scope.newTemplate['file']) {
              $scope.newTemplate.user = vm.currentUser._id;
              settingsService.addInvoiceTemplate($scope.newTemplate).then(function (template) {
                $scope.newTemplate = {};
                $scope.error = "";
                vm.invoiceTemplates.push(template);
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
        templateUrl: 'app/templates/settings/modals/template.html',
        parent: angular.element(document.body),
        targetEvent: $event,
        clickOutsideToClose: true
      };

      $mdDialog.show(dialogObject)
        .finally(function() {
          dialogObject = undefined;
        });
    };

    /**
     * Delete the template with the given templateId.
     *
     * @param $event
     * @param templateId
     */
    let deleteTemplate = ($event, templateId) => {

      var confirm = $mdDialog.confirm()
        .parent(angular.element(document.body))
        .title('Sicher?')
        .content('Willst du die Rechnungsvorlage wirklich löschen?')
        .targetEvent($event)
        .ok('Ja')
        .cancel('Oh. Nein!');

      $mdDialog.show(confirm).then(function() {
        settingsService.deleteInvoiceTemplate(templateId);

        // update cached version
        for (let i=0; i<vm.invoiceTemplates.length; i++) {
          if (vm.invoiceTemplates[i]._id === templateId) {
            vm.invoiceTemplates.splice(i, 1);
            break;
          }
        }
      }, function() {});
    };

    //
    // Controller API
    //
    vm.addUser = addUser;
    vm.deleteUser = deleteUser;
    vm.addTemplate = addTemplate;
    vm.deleteTemplate = deleteTemplate;
  }
})();