(function () {

  'use strict';

  var fs = require('fs');
  var Docxtemplater = require('docxtemplater');
  var moment = require('moment');

  angular
    .module('app.invoice')
    .controller('invoiceCtrl', ['$scope', 'INSURANCE_TYPE', 'patientService', 'settingsService', 'invoiceService', '$state', '$stateParams', '$mdDialog', InvoiceController]);

  function InvoiceController($scope, INSURANCE_TYPE, patientService, settingsService, invoiceService, $state, $stateParams, $mdDialog) {
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
      $scope.doctor = doctor;

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
              return treatmentDate > lastInvoicedDate;
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
          patient: patient,
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
          patient: patient,
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
     * @param invoice
     */
    function createInvoice(invoice) {

      var patient = invoice.patient;
      var amount = invoice.amount;
      var treatments = invoice.treatments;

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

        settingsService.getInvoiceTemplates()
          .then(function (templates) {
            $scope.templates = templates;

            var templateFile;
            if (patient.insurance) {
              var template = getSuitableTemplate(templates, patient);
              if (template && template.hasOwnProperty("file")) {
                templateFile = template.file;
              }
            }

            if (!templateFile) {
              // ask user which template to use
              var dialogObject = {
                controller: function(items) {
                  $scope.templates = items;

                  $scope.abort = function() {
                    $mdDialog.cancel();
                  };

                  $scope.chooseTemplate = function(template) {
                    $mdDialog.hide(template.file);
                  };
                },
                scope: $scope.$new(),
                templateUrl: 'app/templates/invoice/template.html',
                parent: angular.element(document.body),
                clickOutsideToClose: false,
                locals: {
                  items: templates
                }
              };

              $mdDialog.show(dialogObject)
                .then(function (templateFile) {

                  if(templateFile) {
                    createDocumentWithTemplate(templateFile);
                  }
                  else {
                    console.warn("Could not select template file.");
                  }
                }, function () {})
                .finally(function() {
                  dialogObject = undefined;
                });
            }
            else {
              createDocumentWithTemplate(templateFile);
            }
          });

        /**
         *
         * 
         * @param templateContent
         */
        function createDocumentWithTemplate(templateContent) {
          // load the docx file as a binary
          var doc = new Docxtemplater(templateContent);


          var fullSalutation = " ";

          if(patient.salutation) {
            fullSalutation = patient.salutation.indexOf("Herr") == 0 ?
              "Sehr geehrter " : "Sehr geehrte ";

            fullSalutation += patient.salutation + " " + patient.lastname;
          }

          var treatmentDate = "";

          treatments.forEach(function(treatment, index) {
            var date = moment(treatment.date).format('DD.MM.YYYY');

            if(treatments.length == 1)
              treatmentDate += date;
            else {
              switch(index) {
                case treatments.length - 2:
                  treatmentDate += date + " und ";
                  break;
                case treatments.length - 1:
                  treatmentDate += date;
                  break;
                default:
                  treatmentDate += date + ", ";
                  break;
              }
            }
          });

          var treatmentsString = treatments.length > 1 ?
            "durchgeführten osteopathischen Behandlungen" :
            "durchgeführte osteopathische Behandlung";

          // set the templateVariables
          doc.setData({
            "salutation": patient.salutation || " ",
            "first_name": patient.firstname,
            "last_name": patient.lastname,
            "street": patient.street,
            "postal": patient.postal,
            "city": patient.city,
            "full_salutation": fullSalutation,
            "invoice_amount": amount,
            "treatment_date": treatmentDate,
            "treatments": treatmentsString,
            "date": moment().format('DD.MM.YYYY')
          });

          // apply them (replace all occurences of the previously defined tags ...)
          doc.render();

          var buffer = doc.getZip()
            .generate({type: "nodebuffer"});

          fs.writeFileSync(path + "/invoice.docx", buffer);

          var date = moment().format('YYYY');
          var documentName = patient.lastname + ", " + patient.firstname + " " + date + "-XXX.docx";
          triggerDownload(path + "/invoice.docx", documentName);


          // show invoice details in popup before writing data to database
          var dialogObject = {
            controller: function(items) {
              $scope.treatments = items;

              $scope.close = function() {
                $mdDialog.hide();
              };

              $scope.abort = function(template) {
                $mdDialog.cancel();
              };
            },
            scope: $scope.$new(),
            templateUrl: 'app/templates/invoice/positions.html',
            parent: angular.element(document.body),
            clickOutsideToClose: false,
            locals: {
              items: treatments
            }
          };

          $mdDialog.show(dialogObject)
            .then(function () {
              createInvoiceRecord(patient, treatments, invoice);
            }, function () {
              console.log("Abort.");
            })
            .finally(function() {
              dialogObject = undefined;
            });
        }

        /**
         *
         *
         * @param patient
         * @param treatments
         * @param invoice
         */
        function createInvoiceRecord(patient, treatments, invoice) {

          // write invoice data set to database
          invoiceService.createInvoice({
            date: new Date(),
            patientId: patient._id,
            invoice_positions: treatments.map(function(treatment) {
              return treatment.id;
            }),
            invoice_amount: amount,
            doctor: $scope.doctor
          });

          patient['last_invoiced'] = new Date(treatments[treatments.length - 1].date);
          patientService.update(patient._id, patient);

          // delete invoice from invoices array
          var invoiceIndex = $scope.dueInvoices.indexOf(invoice);
          if(invoiceIndex > -1)
            $scope.dueInvoices.splice(invoiceIndex, 1);
          else {
            invoiceIndex = $scope.openInvoices.indexOf(invoice);

            if(invoiceIndex > -1)
              $scope.openInvoices.splice(invoiceIndex, 1);
          }
        }

        /**
         *
         *
         * @param templates
         * @param insuranceType
         * @returns {*}
         */
        function getSuitableTemplate(templates, insuranceType) {

          var defaultTemplate = null;
          var stateTemplate = null;
          var privateTemplate = null;

          templates.forEach(function(template) {
            if(!template.hasOwnProperty("type")) {
              defaultTemplate = template;
            }
            else {
              switch (template["type"]) {
                case INSURANCE_TYPE.state:
                  stateTemplate = template;
                  break;
                case INSURANCE_TYPE.private:
                case INSURANCE_TYPE.privatePlus:
                  privateTemplate = template;
                  break;
                default:
                  console.warn("Unknown template type in database.");
                  break;
              }
            }
          });

          switch (insuranceType) {
            case INSURANCE_TYPE.state:
              return stateTemplate || defaultTemplate;
              break;
            case INSURANCE_TYPE.private:
            case INSURANCE_TYPE.privatePlus:
              return privateTemplate || defaultTemplate;
              break;
            default:
              return null;
          }
        }

        /**
         *
         *
         * @param filePath
         * @param fileName
         */
        function triggerDownload(filePath, fileName) {
          var downloadLink = angular.element('<a></a>');
          downloadLink.attr('href', filePath);
          downloadLink.attr('download', fileName);
          downloadLink[0].click();
        }
      }
    }
  }
})();