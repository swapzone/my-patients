(function () {

  'use strict';

  let shortId = require('shortid');

  angular
    .module('app.patient')
    .controller('TreatmentController', TreatmentController);

  /* @ngInject */
  function TreatmentController($log, $mdDialog, $timeout, loginService, patientService, patient) {
    const vm = this;

    vm.patient = patient;
    vm.patient.treatments.sort((a, b) => {
      return new Date(a.date) - new Date(b.date);
    });

    vm.showForm = false;
    vm.treatmentObject = {
      doctor: loginService.activeUser().name
    };
    vm.originalTreatmentObject = undefined;

    /**
     * Close treatment form.
     */
    vm.closeTreatments = function() {
      if (vm.originalTreatmentObject) {
        vm.treatmentObject.date = vm.originalTreatmentObject.date;
      }
      $mdDialog.cancel();
    };

    /**
     * Stop editing treatments.
     */
    vm.stopEdit = () => {
      if (vm.originalTreatmentObject) {
        vm.treatmentObject.date = vm.originalTreatmentObject.date;
      }
      vm.showForm = false;
    };

    /**
     * Open treatment form.
     *
     * @param treatment
     */
    vm.triggerTreatmentForm = function(treatment) {
      if (treatment && vm.patient.hasOwnProperty('last_invoiced') && vm.patient.last_invoiced.date > treatment.date) {
        $log.warn('Already invoiced.');
        vm.editError = 'Die Behandlung wurde schon abgerechnet und kann nicht mehr geändert werden.';

        $timeout(() => {
          vm.editError = '';
        }, 2000);
        return;
      }

      vm.showForm = !vm.showForm;
      vm.error = null;

      if(treatment) {
        vm.treatmentObject = treatment;
        vm.originalTreatmentObject = JSON.parse(JSON.stringify(treatment));

        var dateObject = moment(treatment.date);
        vm.treatmentObject.date = dateObject.format("DD.MM.YYYY");
      }
      else {
        // new treatment form
        vm.treatmentObject = {
          doctor: loginService.activeUser().name
        };
      }
    };

    /**
     * Save treatment to database.
     */
    vm.saveTreatment = function() {
      if (vm.treatmentObject['date'] && vm.treatmentObject['payment'] && vm.treatmentObject['description'] && vm.treatmentObject['doctor']) {
        var dateFormat = /\d{2}.\d{2}.\d{4}/;
        var complexDateFormat = /\d{4}-\d{2}-\d{2}/;

        if(dateFormat.test(vm.treatmentObject['date']) || complexDateFormat.test(vm.treatmentObject['date'].substring(0, 10))) {

          if(dateFormat.test(vm.treatmentObject['date'])) {
            vm.treatmentObject.date = moment(vm.treatmentObject.date, 'DD.MM.YYYY').utc().format('YYYY-MM-DDTHH:mm:ss.SSS') + 'Z';
          }

          if(!vm.treatmentObject.hasOwnProperty('id')) {
            // new treatment
            vm.treatmentObject.id = shortId.generate();

            patientService.addTreatment(vm.patient._id, vm.treatmentObject)
              .then(function () {
                vm.stopEdit();
              }, function(err) {
                console.error("Could not add treatment: ");
                console.error(err);
              });
          }
          else {
            // update treatment
            patientService.updateTreatment(vm.patient._id, vm.originalTreatmentObject, vm.treatmentObject)
              .then(function () {
                vm.stopEdit();
              }, function(err) {
                console.error("Could not update treatment: ");
                console.error(err);
              });
          }
        }
        else {
          vm.error = "Das Datumsformat muss tt.mm.jjjj entsprechen!";
        }
      }
      else {
        vm.error = "Es müssen alle Felder ausgefüllt sein!";
      }
    };
  }
})();