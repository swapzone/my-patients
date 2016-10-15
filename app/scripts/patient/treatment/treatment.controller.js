(function () {

  'use strict';

  let shortId = require('shortid');

  angular
    .module('app.patient')
    .controller('TreatmentController', TreatmentController);

  /* @ngInject */
  function TreatmentController($mdDialog, loginService, patientService, patient) {
    const vm = this;

    vm.patient = patient;
    vm.showForm = false;
    vm.treatmentObject = {
      doctor: loginService.activeUser().name
    };
    vm.originalTreatmentObject = {};
    vm.originalTreatmentReference = null;

    /**
     * Close treatment form.
     */
    vm.closeTreatments = function() {
      vm.treatmentObject = {};
      $mdDialog.cancel();
    };

    /**
     * Open treatment form.
     *
     * @param treatment
     */
    vm.triggerTreatmentForm = function(treatment) {
      vm.showForm = !vm.showForm;
      vm.error = null;

      if(vm.treatmentObject.hasOwnProperty('date')) {
        vm.treatmentObject.date = moment(vm.treatmentObject.date, 'DD.MM.YYYY').format();
      }

      if(treatment) {
        vm.treatmentObject = treatment;
        vm.originalTreatmentObject = JSON.parse(JSON.stringify(treatment));

        var dateObject = moment(treatment.date);
        vm.treatmentObject.date = dateObject.format("DD.MM.YYYY");
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
            var dateArray = vm.treatmentObject.date.split('.');
            vm.treatmentObject.date = new Date(dateArray[2], dateArray[1] - 1, dateArray[0]);
          }

          if(!vm.treatmentObject.hasOwnProperty('id')) {
            // new treatment
            vm.treatmentObject.id = shortId.generate();

            patientService.addTreatment(vm.patient._id, vm.treatmentObject)
              .then(function () {
                if (!vm.patient.treatments)
                  vm.patient.treatments = [];

                vm.patient.treatments.push(vm.treatmentObject);
                vm.treatmentObject = {
                  doctor: loginService.activeUser().name
                };
                vm.triggerTreatmentForm();
              }, function(err) {
                console.error("Could not add treatment: ");
                console.error(err);
              });
          }
          else {
            // update treatment
            patientService.updateTreatment(vm.patient._id, vm.originalTreatmentObject, vm.treatmentObject)
              .then(function () {
                vm.treatmentObject = {
                  doctor: loginService.activeUser().name
                };
                vm.originalTreatmentObject = {
                  doctor: loginService.activeUser().name
                };
                vm.triggerTreatmentForm();
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