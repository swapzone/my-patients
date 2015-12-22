(function () {

  'use strict';

  var shortId = require("shortid");

  angular
    .module('app.patient')
    .controller('patientDetailCtrl', ['$rootScope', '$scope', 'patientService', '$mdDialog', '$state', '$stateParams', 'postalService', PatientDetailController]);

  function PatientDetailController($rootScope, $scope, patientService, $mdDialog, $state, $stateParams, postalService) {

    $scope.users = $rootScope.users;
    $scope.activePatient = $stateParams.active ? JSON.parse($stateParams.active) : null;

    $scope.showPersonalDetails = false;

    $scope.abort = abort;
    $scope.goBack = goBack;
    $scope.editPatient = editPatient;
    $scope.showTreatment = showTreatment;
    $scope.deletePatient = deletePatient;
    $scope.updatePatient = updatePatient;

    $scope.triggerPersonalDetails = function() {
      $scope.showPersonalDetails = !$scope.showPersonalDetails;
    };

    $scope.postalService = postalService;

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
        templateUrl: 'app/templates/patient/treatment.html',
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
      $state.go("patient.edit", { active: angular.toJson($scope.activePatient) });
    }

    /**
     *
     */
    function goBack() {

      if($stateParams.previousState) {
        $state.go($stateParams.previousState, {});
      }
      else
        $state.go('patient.list', {});
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
        $state.go("patient.details", { active: angular.toJson($scope.activePatient) });
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
                $state.go("patient.details", { active: angular.toJson($scope.activePatient) });
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

      if ($scope.activePatient != null) {

        if($scope.activePatient['birthday']) {
          var dateFormat = /\d{2}.\d{2}.\d{4}/;

          if(!dateFormat.test($scope.activePatient['birthday'])) {
            $mdDialog.show(
              $mdDialog
                .alert()
                .clickOutsideToClose(true)
                .title('Fehler')
                .content('Der Geburtstag muss dem Format tt.mm.jjjj entsprechen!')
                .ok('Ok')
                .targetEvent($event)
              )
              .finally(function() {});

            return;
          }
        }

        patientService.update($scope.activePatient._id, $scope.activePatient).then(function () {
          $state.go("patient.details", { active: angular.toJson($scope.activePatient) });
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
            $state.go("patient.details", { active: angular.toJson($scope.activePatient) });
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
   * @param $mdDialog
   * @param patientService
   * @constructor
   */
  function DialogCtrl($scope, $mdDialog, patientService) {

    $scope.showNewForm = false;
    $scope.newTreatment = {};

    $scope.closeTreatments = function() {
      $scope.newTreatment = {};
      $mdDialog.cancel();
    };

    $scope.triggerTreatmentForm = function() {
      $scope.showNewForm = !$scope.showNewForm;
      $scope.error = null;
    };

    $scope.saveTreatment = function() {

      if ($scope.newTreatment['date'] && $scope.newTreatment['payment'] && $scope.newTreatment['description']) {

        var dateFormat = /\d{2}.\d{2}.\d{4}/;
        var complexDateFormat = /\d{4}-\d{2}-\d{2}/;

        if(dateFormat.test($scope.newTreatment['date']) || complexDateFormat.test($scope.newTreatment['date'].substring(0, 10))) {

          if(dateFormat.test($scope.newTreatment['date'])) {
            var dateArray = $scope.newTreatment.date.split('.');
            $scope.newTreatment.date = new Date(dateArray[2], dateArray[1] - 1, dateArray[0]);
          }

          $scope.newTreatment.id = shortId.generate();

          patientService.addTreatment($scope.activePatient._id, $scope.newTreatment).then(function () {
            if (!$scope.activePatient.treatments)
              $scope.activePatient.treatments = [];

            $scope.activePatient.treatments.push($scope.newTreatment);
            $scope.newTreatment = {};
            $scope.triggerTreatmentForm();
          }, function(err) {
            console.error("Could not add treatment: ");
            console.error(err);
          });
        }
        else {
          $scope.error = "Das Datumsformat muss tt.mm.jjjj entsprechen!";
        }
      }
      else {
        $scope.error = "Datum, Bezahlung und die Behandlung müssen ausgefüllt sein!";
      }
    };
  }
})();