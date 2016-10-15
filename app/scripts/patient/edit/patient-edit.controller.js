(function () {

  'use strict';

  angular
    .module('app.patient')
    .controller('PatientEditController', PatientEditController);

  /* @ngInject */
  function PatientEditController($log, $mdDialog, $scope, $state, $stateParams, patientService, postalService, settingsService) {
    let vm = this;

    vm.users = settingsService.users;

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
      $log.error('PatientId is mandatory in edit view.');
      return;
    }

    vm.patient = patientService.patients[patientIndex];
    vm.patient.treatments.sort(function(a, b) {
      return b.date - a.date;
    });

    vm.postalService = postalService;

    /**
     * Checks if the patient has any open invoices or receipts.
     *
     * @returns {boolean}
     */
    function hasOpenInvoices() {

      const hasOpenReceipts = vm.patient.treatments.some(
        treatment => (treatment.payment === 'Quittung') && !treatment.closed);

      const hasTreatments = !!vm.patient.treatments.length;
      const wasInvoiced = !!vm.patient.hasOwnProperty('last_invoiced');

      const hasOpenInvoice = hasTreatments && wasInvoiced ?
        vm.patient.treatments[vm.patient.treatments.length - 1].date > vm.patient.last_invoiced.date : false;

      return hasOpenReceipts || !wasInvoiced && hasTreatments || hasOpenInvoice;
    }

    /**
     * Open treatment dialog.
     *
     * @param $event
     */
    function showTreatment($event) {
      var dialogObject = {
        scope: $scope.$new(),
        controller: 'TreatmentCtrl',
        controllerAs: 'TreatmentCtrl',
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

    /**
     * Go to last state.
     */
    function goBack() {
      if ($stateParams.previousState) {
        $state.go($stateParams.previousState, {});
      }
      else
        $state.go('patient.list', {});
    }

    /**
     * Abort editing of patient.
     */
    function abort() {
      $state.go("patient.details", { patientId: vm.patient._id });
    }
    
    /**
     * Delete the patient.
     *
     * @param $event
     */
    function deletePatient($event) {
      if (!vm.patient) {
        $log.warn('Patient object is not set.');
        return;
      }

      if (hasOpenInvoices()) {
        $mdDialog.show(
          $mdDialog
            .alert()
            .clickOutsideToClose(true)
            .title('Fehler')
            .content('Der Patient hat noch ausstehende Rechnungen und kann nicht gelöscht werden.')
            .ok('Ok')
            .targetEvent($event)
          )
          .finally(function() {});

        return;
      }

      var confirm = $mdDialog.confirm()
        .title('Sicher?')
        .content('Willst du den Patient wirklich löschen?')
        .ok('Ja')
        .cancel('Oh. Nein!')
        .targetEvent($event);

      $mdDialog.show(confirm).then(function () {
        patientService.deletePatient(vm.patient._id).then(function (numRemoved) {
          if(numRemoved === 1) {
            vm.patient = null;
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
                $state.go("patient.details", { patientId: vm.patient._id });
              });
          }
        });
      });
    }

    /**
     * Update the patient.
     *
     * @param $event
     */
    function updatePatient($event) {

      if (vm.patient != null) {

        if(vm.patient['birthday']) {
          var dateFormat = /\d{2}.\d{2}.\d{4}/;

          if(!dateFormat.test(vm.patient['birthday'])) {
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

        patientService.updatePatient(vm.patient._id, vm.patient).then(function () {
          $state.go("patient.details", { patientId: vm.patient._id });
        }, function(err) {
          $log.error(err);

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
              $state.go("patient.details", { patientId: vm.patient._id });
            });
        });
      }
      else {
        $log.error("Patient-Objekt nicht verfügbar.");
      }
    }

    //
    // Controller API
    //
    vm.abort = abort;
    vm.goBack = goBack;
    vm.showTreatment = showTreatment;
    vm.deletePatient = deletePatient;
    vm.updatePatient = updatePatient;
  }
})();