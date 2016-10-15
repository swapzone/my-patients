(function () {

  'use strict';

  angular
    .module('app.patient')
    .controller('PatientNewController', PatientNewController);

  /* @ngInject */
  function PatientNewController($scope, $mdDialog, $state, $sessionStorage, loginService, patientService, postalService, settingsService) {
    const vm = this;

    // $rootScope.$on('backupRestored', function () {
    //   settingsService.getUsers()
    //     .then((users) => {
    //       vm.users = users;
    //     });
    // });

    vm.users = settingsService.users;
    vm.patientSaved = false;
    vm.postalService = postalService;

    /**
     * Reset new patient data structure.
     */
    let resetNewPatient = () => {
      vm.newPatient = {
        doctor: loginService.activeUser().name,
        insurance: {},
        history: {},
        risks: {},
        treatments: []
      };
    };

    /**
     * Abort adding new patient.
     *
     * @param $event
     */
    let abort = ($event) => {
      var confirm = $mdDialog.confirm()
        .parent(angular.element(document.body))
        .title('Sicher?')
        .content('Willst du den Vorgang wirklich abbrechen?')
        .targetEvent($event)
        .ok('Ja')
        .cancel('Oh. Nein!');

      $mdDialog.show(confirm).then(function() {
        delete $sessionStorage["newPatient"];
        resetNewPatient();

        $state.go("patient.list", {});
      });
    };

    /**
     * Store new patient to database.
     *
     * @param $event
     */
    let savePatient = ($event) => {
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

        patientService.createPatient(vm.newPatient).then(function () {
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
    };

    vm.$onInit = () => {
      if($sessionStorage['newPatient']) {
        vm.newPatient = $sessionStorage['newPatient'];
      }
      else {
        vm.newPatient = {
          doctor: loginService.activeUser().name,
          insurance: {},
          history: {},
          risks: {},
          treatments: []
        };
      }

      let unbindStateChangeListener = $scope.$on('$stateChangeStart',
        (event, toState, toParams, fromState) => {
          if (fromState['name'] === 'patient.new' && toState['name'] !== 'login') {
            if (!vm.patientSaved) {
              $sessionStorage['newPatient'] = vm.newPatient;
            }
            else {
              delete $sessionStorage["newPatient"];
              resetNewPatient();
              vm.patientSaved = true;
            }
            unbindStateChangeListener();
          }
        });
    };

    //
    // Controller API
    //
    vm.abort = abort;
    vm.savePatient = savePatient;
  }
})();