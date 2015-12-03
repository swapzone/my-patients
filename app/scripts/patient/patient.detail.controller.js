(function () {

  'use strict';

  angular
    .module('app.patient')
    .controller('patientDetailCtrl', ['$scope', 'patientService', '$mdDialog', '$state', '$stateParams', PatientDetailController]);

  function PatientDetailController($scope, patientService, $mdDialog, $state, $stateParams) {

    $scope.activePatient = $stateParams.active ? JSON.parse($stateParams.active) : null;

    $scope.showPersonalDetails = false;

    $scope.abort = abort;
    $scope.editPatient = editPatient;
    $scope.showTreatment = showTreatment;
    $scope.deletePatient = deletePatient;
    $scope.updatePatient = updatePatient;

    $scope.triggerPersonalDetails = function() {
      $scope.showPersonalDetails = !$scope.showPersonalDetails;
    };

    /**
     *
     *
     * @param $event
     */
    function showTreatment($event) {

      var dialogObject = {
        controller: DialogCtrl,
        scope: $scope.$new(),
        controllerAs: 'treatmentCtrl',
        templateUrl: 'app/scripts/templates/patient/treatment.html',
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
     */
    function editPatient() {
      $state.go("patient.edit", { active: JSON.stringify($scope.activePatient) });
    }

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
        $state.go("patient.details", { active: JSON.stringify($scope.activePatient) });
      }, function() { });
    }

    /**
     *
     *
     * @param $event
     */
    function deletePatient($event) {

      if($scope.activePatient == null) {
        return;
      }

      var confirm = $mdDialog.confirm()
        .title('Sicher?')
        .content('Willst du den Patient wirklich löschen?')
        .ok('Ja')
        .cancel('Oh. Nein!')
        .targetEvent($event);


      $mdDialog.show(confirm).then(function () {
        patientService.delete($scope.activePatient._id).then(function (numRemoved) {
          if(numRemoved === 1) {
            $scope.activePatient = null;
            $state.go("patient.list", {});
          }
          else {
            $mdDialog.show(
              $mdDialog
                .alert()
                .clickOutsideToClose(true)
                .title('Fehler')
                .content('Patient konnte nicht gelöscht werden.')
                .ok('Ok')
                .targetEvent($event)
              )
              .finally(function() {
                $state.go("patient.details", { active: JSON.stringify($scope.activePatient) });
              });
          }
        });
      }, function (err) {
        console.error("Patient konnte nicht gelöscht werden.");
        console.error(err);
      });
    }

    /**
     *
     *
     * @param $event
     */
    function updatePatient($event) {

      console.log("Cool.");

      if ($scope.activePatient != null) {

        console.log("Noch cooler.");

        patientService.update($scope.activePatient._id, $scope.activePatient).then(function () {
          $state.go("patient.details", { active: JSON.stringify($scope.activePatient) });
        }, function(err) {
          console.error(err);

          $mdDialog.show(
            $mdDialog
              .alert()
              .clickOutsideToClose(true)
              .title('Fehler')
              .content('Patientendaten konnten nicht gespeichert werden.')
              .ok('Ok')
              .targetEvent($event)
          )
          .finally(function() {
            $state.go("patient.details", { active: JSON.stringify($scope.activePatient) });
          });
        });
      }
      else {
        console.error("Patient-Objekt nicht verfügbar.");
      }
    }
  }

  /**
   * Controller for treatment dialog.
   *
   * @param $scope
   * @param patientService
   * @constructor
   */
  function DialogCtrl($scope, patientService) {

    $scope.showNewForm = false;
    $scope.newTreatment = {};

    $scope.triggerTreatmentForm = function() {
      $scope.showNewForm = !$scope.showNewForm;
      $scope.error = null;
    };

    $scope.saveTreatment = function() {

      if ($scope.newTreatment['date'] && $scope.newTreatment['payment'] && $scope.newTreatment['description']) {
        patientService.addTreatment($scope.activePatient._id, $scope.newTreatment).then(function () {
          if(!$scope.activePatient.treatments)
            $scope.activePatient.treatments = [];

          $scope.activePatient.treatments.push($scope.newTreatment);
          $scope.triggerTreatmentForm();
        });
      }
      else {
        $scope.error = "Datum, Bezahlung und die Behandlung müssen ausgefüllt sein!";
      }
    };
  }
})();