(function () {

  'use strict';

  angular
    .module('app.patient')
    .controller('PatientDetailController', PatientDetailController);

  /* @ngInject */
  function PatientDetailController($scope, $state, $stateParams, $mdDialog, users) {
    let vm = this;
    
    vm.patient = $stateParams.active ? JSON.parse($stateParams.active) : null;
    vm.patient.treatments.sort(function(a, b) {
      return b.date - a.date;
    });

    vm.showPersonalDetails = false;

    /**
     * Go to edit patient screen.
     */
    function editPatient() {
      $state.go("patient.edit", { active: angular.toJson(vm.patient) });
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
      let formScope = $scope.$new();
      formScope.patient = vm.patient;
      formScope.users = users;

      var dialogObject = {
        scope: formScope,
        controller: 'TreatmentController',
        controllerAs: 'vm',
        templateUrl: 'app/templates/patient/treatment/treatment.html',
        parent: angular.element(document.body),
        targetEvent: $event,
        clickOutsideToClose: false
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