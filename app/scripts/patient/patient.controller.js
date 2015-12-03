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
    $scope.filter = null;

    $scope.toggleFilter = function() {
      $scope.showFilter = !$scope.showFilter;

      if(!$scope.showFilter) {
        $scope.filter = null;
      }
    };

    $scope.$watch('showFilter', function() {
      // the variable must be watched since it can be set from the
      // watchMe directive
      if($scope.showFilter == false)
        $scope.filter = null;
    });

    $scope.abort = abort;
    $scope.selectPatient = selectPatient;
    $scope.savePatient = savePatient;
    $scope.filterPatient = filterPatient;

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
        patientService.create($scope.newPatient).then(function () {
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
     *
     * @param patient
     * @returns {boolean}
     */
    function filterPatient(patient) {

      if(!$scope.filter)
        return true;

      if(patient.lastname.indexOf($scope.filter) > -1)
        return true;

      return patient.firstname.indexOf($scope.filter) > -1;
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