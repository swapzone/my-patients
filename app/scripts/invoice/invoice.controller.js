(function () {

  'use strict';

  var fs = require('fs');
  var Docxtemplater = require('docxtemplater');

  angular
    .module('app.invoice')
    .controller('invoiceCtrl', ['$scope', 'INSURANCE_TYPE', 'patientService', 'invoiceService', '$state', '$stateParams', InvoiceController]);

  function InvoiceController($scope, INSURANCE_TYPE, patientService, invoiceService, $state, $stateParams) {
    $scope.selectedInvoices = undefined;
    $scope.openInvoices = [];
    $scope.dueInvoices = [];

    $scope.createInvoice = createInvoice;

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
            },
            insurance: patient.insurance ? patient.insurance.type : undefined
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

    /**
     *
     *
     * @param patient
     */
    function createInvoice(patient) {
      alert("Not yet implemented.");

      // create temp directory if not available
      var path = __dirname + '/temp';
      fs.exists(path, function(exists) {
        if (!exists) {
          fs.mkdir(path, function() {
            createDocument();
          });
        }
        else {
          createDocument();
        }
      });

      /**
       *
       */
      function createDocument() {

        var content;
        if(patient.insurance) {
          switch(patient.insurance) {
            case INSURANCE_TYPE.state:
              // state template
              break;
            case INSURANCE_TYPE.private:
            case INSURANCE_TYPE.privatePlus:
              // private template
              break;
            default:

          }
        }
        else {
          // ask user which template to use

        }

        // load the docx file as a binary
        /*
        var content = fs
          .readFileSync(__dirname + "/input.docx", "binary");*/

        var doc = new Docxtemplater(content);

        // set the templateVariables
        doc.setData({
          "first_name": "Hipp",
          "last_name": "Edgar",
          "phone": "0652455478",
          "description": "New Website"
        });

        // apply them (replace all occurences of {first_name} by Hipp, ...)
        doc.render();

        var buffer = doc.getZip()
          .generate({type: "nodebuffer"});

        fs.writeFileSync(path + "/invoice.docx", buffer);

        // write invoice data set to database
      }
    }
  }
})();