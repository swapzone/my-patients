(function () {

  'use strict';

  angular
    .module('app.patient')
    .controller('patientDetailCtrl', ['$scope', 'patientService', '$mdDialog', '$state', '$stateParams', PatientDetailController]);

  function PatientDetailController($scope, patientService, $mdDialog, $state, $stateParams) {

    $scope.activePatient = $stateParams.active ? JSON.parse($stateParams.active) : null;

    $scope.showPersonalDetails = false;

    $scope.editPatient = editPatient;
    $scope.showTreatment = showTreatment;
    $scope.deletePatient = deletePatient;
    $scope.updatePatient = updatePatient;

    $scope.triggerPersonalDetails = function() {
      $scope.showPersonalDetails = !$scope.showPersonalDetails;
    };

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

    function editPatient() {
      alert("Noch nicht implementiert!");
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
        patientService.delete($scope.activePatient).then(function (affectedRows) {
          var index = $scope.patients.indexOf($scope.activePatient);
          $scope.patients.splice(index, 1);

          $scope.activePatient = null;
          $state.go("patient.list", {});
        });
      }, function () { });
    }

    /**
     *
     *
     * @param $event
     */
    function updatePatient($event) {

      if ($scope.activePatient != null) {
        patientService.update($scope.activePatient).then(function (affectedRows) {
          $mdDialog.show(
            $mdDialog
              .alert()
              .clickOutsideToClose(true)
              .title('Super')
              .content('Patientendaten wurden erfolgreich gespeichert!')
              .ok('Ok')
              .targetEvent($event)
          );
        });
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