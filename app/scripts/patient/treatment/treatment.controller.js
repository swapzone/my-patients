(function (moment) {

  'use strict';

  let shortId = require('shortid');

  angular
    .module('app.patient')
    .controller('TreatmentController', TreatmentController);

  /* @ngInject */
  function TreatmentController($log, $mdDialog, $timeout, loginService, patientService, patientId) {
    const vm = this;

    let patientIndex = -1;
    if (patientId) {
      patientService.patients.some((patient, index) =>  {
        if (patient._id === patientId) {
          patientIndex = index;
          return true;
        }
        return false;
      });
    }
    else {
      $log.error('PatientId is mandatory in Treatment Controller.');
      return;
    }

    vm.patient = patientService.patients[patientIndex];
    vm.patient.treatments.sort((a, b) => {
      return new Date(a.date) - new Date(b.date);
    });

    vm.showForm = false;
    vm.treatmentObject = {
      doctor: loginService.activeUser().name
    };
    vm.treatmentBackup = undefined;

    /**
     * Close treatment form.
     */
    vm.closeTreatments = function() {
      if (vm.treatmentBackup) {
        for (let prop in vm.treatmentBackup) {
          if (vm.treatmentBackup.hasOwnProperty(prop)) {
            vm.treatmentObject[prop] = vm.treatmentBackup[prop];
          }
        }
        vm.treatmentBackup = undefined;
      }
      $mdDialog.cancel();
    };

    /**
     * Stop editing treatments.
     */
    vm.stopEdit = () => {
      if (vm.treatmentBackup) {
        for (let prop in vm.treatmentBackup) {
          if (vm.treatmentBackup.hasOwnProperty(prop)) {
            vm.treatmentObject[prop] = vm.treatmentBackup[prop];
          }
        }
        vm.treatmentBackup = undefined;
      }
      vm.showForm = false;
    };

    /**
     * Open treatment form.
     *
     * @param treatment
     */
    vm.triggerTreatmentForm = function(treatment) {
      if (treatment && treatment.payment === 'Quittung' && treatment.closed) {
        vm.editError = 'Du kannst eine geschlossene Quittung nicht bearbeiten.';

        $timeout(() => {
          vm.editError = '';
        }, 2500);
        return;
      }

      if (treatment && treatment.doctor !== loginService.activeUser().name) {
        vm.editError = 'Du kannst nur deine eigenen Behandlungen bearbeiten.';

        $timeout(() => {
          vm.editError = '';
        }, 2500);
        return;
      }

      let lastInvoicedFromUser = vm.patient.last_invoiced && vm.patient.last_invoiced[loginService.activeUser()._id] ?
        vm.patient.last_invoiced[loginService.activeUser()._id] : undefined;

      if (treatment && treatment.payment !== 'Quittung' && lastInvoicedFromUser && lastInvoicedFromUser >= new Date(treatment.date)) {
        $log.warn('Already invoiced.');
        vm.editError = 'Die Behandlung wurde schon abgerechnet und kann nicht mehr geändert werden.';

        $timeout(() => {
          vm.editError = '';
        }, 2500);
        return;
      }

      vm.showForm = !vm.showForm;
      vm.error = null;

      if(treatment) {
        vm.treatmentObject = treatment;
        vm.treatmentBackup = JSON.parse(JSON.stringify(treatment));

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
          let fullDate = vm.treatmentObject.date;

          if (dateFormat.test(vm.treatmentObject.date)) {
            fullDate = moment(vm.treatmentObject.date, 'DD.MM.YYYY').utc().format('YYYY-MM-DDTHH:mm:ss.SSS') + 'Z';
          }

          if (!moment(fullDate, 'YYYY-MM-DDTHH:mm:ss.SSS').isValid()) {
            vm.error = "Bitte gebe ein gültiges Datum ein.";
            return;
          }

          // check if date is before last invoice
          let lastInvoicedFromUser = vm.patient.last_invoiced && vm.patient.last_invoiced[loginService.activeUser()._id] ?
            vm.patient.last_invoiced[loginService.activeUser()._id] : undefined;

          if (vm.treatmentObject.payment === 'Rechnung' && lastInvoicedFromUser && new Date(fullDate) <= lastInvoicedFromUser) {
            vm.error = "Du kannst keine Behandlung erstellen, wenn der Zeitraum schon abgerechnet wurde.";
            return;
          }

          vm.treatmentObject.date = fullDate;

          if (!vm.treatmentObject.hasOwnProperty('id')) {
            // new treatment
            vm.treatmentObject.id = shortId.generate();

            patientService.addTreatment(vm.patient._id, vm.treatmentObject)
              .then(function () {
                vm.treatmentBackup = undefined;

                vm.stopEdit();
              }, function(err) {
                $log.error("Could not add treatment: ");
                $log.error(err);
              });
          }
          else {
            // update treatment
            patientService.updateTreatment(vm.patient._id, vm.treatmentObject.id, vm.treatmentObject)
              .then(function () {
                vm.treatmentBackup = undefined;

                vm.stopEdit();
              }, function(err) {
                $log.error("Could not update treatment: ");
                $log.error(err);
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
})(window.moment);