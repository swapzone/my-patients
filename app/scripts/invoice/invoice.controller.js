(function () {

  'use strict';

  angular
    .module('app.invoice')
    .controller('invoiceCtrl', ['$scope', 'patientService', 'invoiceService', '$state', '$stateParams', InvoiceController]);

  function InvoiceController($scope, patientService, invoiceService, $state, $stateParams) {
    $scope.selectedInvoices = undefined;
    $scope.openInvoices = [];
    $scope.dueInvoices = [];

    $scope.showOpenInvoices = function() {
      $scope.selectedInvoices = $scope.openInvoices;

      $scope.openInvoicesActive = true;
      $scope.dueInvoicesActive = false;
    };

    $scope.showDueInvoices = function() {
      $scope.selectedInvoices = $scope.dueInvoices;

      $scope.openInvoicesActive = false;
      $scope.dueInvoicesActive = true;
    };

    init("Victoria Ott");

    function init(doctor) {

      patientService.getPatients()
        .then(function(patients) {
          extractInvoices(patients, doctor);

          if($stateParams.parameter) {
            if($stateParams.parameter == "due") {
              $scope.selectedInvoices = $scope.dueInvoices;

              $scope.openInvoicesActive = false;
              $scope.dueInvoicesActive = true;
            }
            else {
              $scope.selectedInvoices = $scope.openInvoices;

              $scope.openInvoicesActive = true;
              $scope.dueInvoicesActive = false;
            }
          }
        }, function(err) {
          console.error("Could not initialize invoice module: ");
          console.error(err);
        });
    }

    $scope.goToPatientDetails = function(patientId) {

      patientService.getPatientById(patientId)
        .then(function(patient) {

          $state.go("patient.details", {
            active: angular.toJson(patient),
            previousState: "invoice.list",
            parameter: $scope.dueInvoicesActive ? "due" : "open"
          });
        }, function(err) {
          console.error("Could not get patient by id: ");
          console.error(err);
        });
    };

    /**
     *
     *
     * @param patients
     * @param doctor
     */
    function extractInvoices(patients, doctor) {

      patients.forEach(function(patient) {

        if(patient.treatments) {
          var treatments = patient.treatments.filter(function (treatment) {

            var isTreatedByDoctor = !doctor || doctor && treatment['doctor'] == doctor;
            var isOfTypeInvoice = treatment['payment'] == "Rechnung";

            return isTreatedByDoctor && isOfTypeInvoice;
          });

          if (patient.hasOwnProperty("last_invoiced")) {
            var lastInvoicedDate = new Date(patient['last_invoiced']);

            treatments = treatments.filter(function (treatment) {
              var treatmentDate = new Date(treatment.date);
              return new treatmentDate > lastInvoicedDate;
            });
          }

          if (treatments && treatments.length) {
            treatments.sort(treatmentSort);
            classifyInvoice(patient, treatments);
          }
        }
      });
    }

    /**
     *
     *
     * @param patient
     * @param treatments
     */
    function classifyInvoice(patient, treatments) {
      var openLiabilities = [];
      var dueLiabilities = [];

      treatments.forEach(function(treatment) {

        if(treatment['postpone']) {
          openLiabilities.push(treatment);
        }
        else {
          if(openLiabilities.length) {
            openLiabilities.forEach(function(openInvoice) {
              dueLiabilities.push(openInvoice);
            });
            openLiabilities = [];
          }

          dueLiabilities.push(treatment);
        }
      });

      var amount = 0;
      if(openLiabilities.length) {
        amount = openLiabilities.map(function(openLiability) {
          return openLiability.amount || 0;
        }).reduce(function(oldValue, newValue) {
          return parseFloat(oldValue) + parseFloat(newValue);
        });

        $scope.openInvoices.push({
          patient: {
            id: patient._id,
            firstname: patient.firstname,
            lastname: patient.lastname,
            address: {
              street: patient.street,
              postal: patient.postal,
              city: patient.city
            }
          },
          amount: amount,
          treatments: openLiabilities.map(function(openLiability) {
            return {
              id: openLiability.id,
              date: openLiability.date,
              amount: openLiability.amount,
              description: openLiability.description
            };
          })
        });
      }

      if(dueLiabilities.length) {
        amount = dueLiabilities.map(function(openLiability) {
          return openLiability.amount || 0;
        }).reduce(function(oldValue, newValue) {
          return parseFloat(oldValue) + parseFloat(newValue);
        });

        $scope.dueInvoices.push({
          patient: {
            id: patient._id,
            firstname: patient.firstname,
            lastname: patient.lastname,
            address: {
              street: patient.street,
              postal: patient.postal,
              city: patient.city
            }
          },
          amount: amount,
          treatments: dueLiabilities.map(function(dueLiability) {
            return {
              id: dueLiability.id,
              date: dueLiability.date,
              amount: dueLiability.amount,
              description: dueLiability.description
            };
          })
        });
      }
    }

    /**
     *
     *
     * @param a
     * @param b
     * @returns {boolean}
     */
    function treatmentSort(a, b) {
      return new Date(a.date) > new Date(b.date);
    }
  }
})();