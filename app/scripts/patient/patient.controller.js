(function () {

  'use strict';

  angular
    .module('app.patient')
    .controller('patientCtrl', ['$scope', 'patientService', '$q', '$mdDialog', PatientController]);

  function PatientController($scope, patientService, $q, $mdDialog) {
    var self = this;

    self.selected = null;
    self.patients = [];
    self.selectedIndex = 0;
    self.filterText = null;
    self.selectPatient = selectPatient;
    self.deletePatient = deletePatient;
    self.savePatient = savePatient;

    // Load initial data
    getAllPatients();

    //----------------------
    // Internal functions
    //----------------------

    function selectPatient(patient, index) {
      self.selected = angular.isNumber(patient) ? self.patients[patient] : patient;
      self.selectedIndex = angular.isNumber(patient) ? patient: index;
    }

    function deletePatient($event) {
      var confirm = $mdDialog.confirm()
        .title('Are you sure?')
        .content('Are you sure want to delete this patient?')
        .ok('Yes')
        .cancel('No')
        .targetEvent($event);


      $mdDialog.show(confirm).then(function () {
        patientService.destroy(self.selected.patient_id).then(function (affectedRows) {
          self.patients.splice(self.selectedIndex, 1);
        });
      }, function () { });
    }

    function savePatient($event) {
      if (self.selected != null && self.selected.patient_id != null) {
        patientService.update(self.selected).then(function (affectedRows) {
          $mdDialog.show(
            $mdDialog
              .alert()
              .clickOutsideToClose(true)
              .title('Success')
              .content('Data Updated Successfully!')
              .ok('Ok')
              .targetEvent($event)
          );
        });
      }
      else {
        //self.selected.patient_id = new Date().getSeconds();
        patientService.create(self.selected).then(function (affectedRows) {
          $mdDialog.show(
            $mdDialog
              .alert()
              .clickOutsideToClose(true)
              .title('Success')
              .content('Data Added Successfully!')
              .ok('Ok')
              .targetEvent($event)
          );
        });
      }
    }

    function getAllPatients() {
      patientService.getPatients().then(function (patients) {
        $scope.patients = patients;
        $scope.selected = patients[0];
      });
    }
  }
})();