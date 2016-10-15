(function () {

  'use strict';

  angular
    .module('app.patient')
    .controller('PatientDetailController', PatientDetailController);

  /* @ngInject */
  function PatientDetailController($log, $scope, $state, $stateParams, $mdDialog, patientService) {
    const vm = this;

    let patientIndex = -1;
    if ($stateParams.patientId) {
      patientService.patients.some((patient, index) =>  {
        if (patient._id === $stateParams.patientId) {
          patientIndex = index;
          return true;
        }
        return false;
      });
    }
    else {
      $log.error('PatientId is mandatory in detail view.');
      return;
    }

    vm.patient = patientService.patients[patientIndex];
    vm.patient.treatments.sort(function(a, b) {
      return b.date - a.date;
    });

    vm.showPersonalDetails = false;

    /**
     * Go to edit patient screen.
     */
    function editPatient() {
      $state.go("patient.edit", { patientId: vm.patient._id });
    }

    /**
     * Go to last state.
     */
    function goBack() {

      if ($stateParams.previousState) {
        $state.go($stateParams.previousState, {});
      }
      else {
        $state.go('patient.list', {});
      }
    }

    /**
     * Open treatment form.
     *
     * @param $event
     */
    function showTreatment($event) {
      var dialogObject = {
        scope: $scope.$new(),
        controller: 'TreatmentController',
        controllerAs: 'vm',
        templateUrl: 'app/templates/patient/treatment/treatment.html',
        parent: angular.element(document.body),
        targetEvent: $event,
        clickOutsideToClose: false,
        locals: {
          patientId: vm.patient._id
        }
      };

      $mdDialog.show(dialogObject)
        .finally(function() {
          dialogObject = undefined;
        });
    }

    //
    // Controller API
    //
    vm.goBack = goBack;
    vm.editPatient = editPatient;
    vm.showTreatment = showTreatment;
  }
})();