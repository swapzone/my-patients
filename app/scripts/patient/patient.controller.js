(function () {

  'use strict';

  angular
    .module('app.patient')
    .controller('patientCtrl', ['$scope', 'patientService', '$mdDialog', '$state', '$sessionStorage', PatientController]);

  function PatientController($scope, patientService, $mdDialog, $state, $sessionStorage) {

    if($sessionStorage['newPatient'])
      $scope.newPatient = $sessionStorage['newPatient'];
    else
      $scope.newPatient = {
        insurance: {},
        history: {},
        risks: {},
        treatments: []
      };

    $scope.patientSaved = false;
    $scope.showFilter = false;

    $scope.toggleFilter = function() {
      $scope.showFilter = !$scope.showFilter;
    };

    $scope.abort = abort;
    $scope.selectPatient = selectPatient;
    $scope.savePatient = savePatient;

    // Load initial data
    getAllPatients();

    $scope.$on('$stateChangeStart',
      function(event, toState, toParams, fromState) {
        if(fromState['name'] == "patient.new") {

          if(!$scope.patientSaved)
            $sessionStorage['newPatient'] = $scope.newPatient;
          else {
            resetNewPatient();
            $scope.patientSaved = false;
          }
        }

        if(fromState['name'] == "patient.details") {
          $scope.activePatient = null;
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

      $scope.newPatient = {
        insurance: {},
        history: {},
        risks: {},
        treatments: []
      };
    }

    /**
     *
     *
     * @param index
     */
    function selectPatient(index) {
      $state.go("patient.details", { active: JSON.stringify($scope.patients[index]) });
    }

    /**
     *
     *
     * @param $event
     */
    function savePatient($event) {

      if ($scope.newPatient['firstname'] && $scope.newPatient['lastname']) {
        patientService.create($scope.newPatient).then(function (affectedRows) {
          $mdDialog.show(
            $mdDialog
              .alert()
              .clickOutsideToClose(true)
              .title('Super!')
              .content('Patient wurde erfolgreich angelegt!')
              .ok('Ok')
              .targetEvent($event)
          ).then(function() {
            $scope.patientSaved = true;
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

    /**
     *
     */
    function getAllPatients() {
      patientService.getPatients().then(function (patients) {
        patients.sort(function(a, b) {
          return a['lastname'] > b['lastname'];
        });

        $scope.patients = patients;
      });
    }
  }
})();