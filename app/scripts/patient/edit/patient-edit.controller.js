(function () {

  'use strict';

  angular
    .module('app.patient')
    .controller('PatientEditController', PatientEditController);

  /* @ngInject */
  function PatientEditController($scope, $rootScope, patientService, postalService, $mdDialog, $state, $sessionStorage) {
    let vm = this;

    if($sessionStorage['newPatient'])
      vm.newPatient = $sessionStorage['newPatient'];
    else
      vm.newPatient = {
        insurance: {},
        history: {},
        risks: {},
        treatments: []
      };

    vm.users = $rootScope.users;
    vm.patientSaved = false;

    vm.abort = abort;
    vm.savePatient = savePatient;

    vm.postalService = postalService;


    $scope.$on('$stateChangeStart',
      function(event, toState, toParams, fromState) {
        if(fromState['name'] == "patient.new") {

          if(!vm.patientSaved)
            $sessionStorage['newPatient'] = vm.newPatient;
          else {
            resetNewPatient();
            vm.patientSaved = false;
          }
        }
      });

    /**
     *
     *
     * @param $event
     */
    function abort($event) {

      var confirm = $mdDialog.confirm()
        .parent(angular.element(document.body))
        .title('Sicher?')
        .content('Willst du den Vorgang wirklich abbrechen?')
        .targetEvent($event)
        .ok('Ja')
        .cancel('Oh. Nein!');

      $mdDialog.show(confirm).then(function() {
        resetNewPatient();

        $state.go("patient.list", {});
      }, function() { });
    }

    /**
     *
     */
    function resetNewPatient() {

      delete $sessionStorage["newPatient"];

      vm.newPatient = {
        insurance: {},
        history: {},
        risks: {},
        treatments: []
      };
    }

    /**
     *
     *
     * @param $event
     */
    function savePatient($event) {

      if (vm.newPatient['firstname'] && vm.newPatient['lastname']) {

        if(vm.newPatient['birthday']) {
          var dateFormat = /\d{2}.\d{2}.\d{4}/;

          if(!dateFormat.test(vm.newPatient['birthday'])) {
            $mdDialog.show(
              $mdDialog
                .alert()
                .clickOutsideToClose(true)
                .title('Fehler')
                .content('Der Geburtstag muss dem Format tt.mm.jjjj entsprechen!')
                .ok('Ok')
                .targetEvent($event)
              )
              .finally(function () {
              });

            return;
          }
        }

        patientService.create(vm.newPatient).then(function () {
          $mdDialog.show(
            $mdDialog
              .alert()
              .clickOutsideToClose(true)
              .title('Super!')
              .content('Patient wurde erfolgreich angelegt!')
              .ok('Ok')
              .targetEvent($event)
          ).then(function() {
            vm.patientSaved = true;
            $state.go("patient.list", {});
          });
        });
      }
      else {
        $mdDialog.show(
          $mdDialog
            .alert()
            .clickOutsideToClose(true)
            .title('Nicht vollständig')
            .content('Vor- und Nachname müssen ausgefüllt werden!')
            .ok('Ok')
            .targetEvent($event)
        );
      }
    }
  }
})();