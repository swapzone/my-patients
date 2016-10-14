(function (moment) {

  'use strict';

  var fs = require('fs');
  var os = require('os');
  var Docxtemplater = require('docxtemplater');

  angular
    .module('app.invoice')
    .controller('InvoiceCtrl', InvoiceController);

  /* @ngInject */
  function InvoiceController($scope, INSURANCE_TYPE, INVOICE_TYPE, patientService, settingsService, invoiceService, $state, $mdDialog) {
    $scope.selectedInvoices = undefined;

    $scope.openInvoices = [];
    $scope.dueInvoices = [];
    $scope.oldInvoices = [];
    $scope.openReceipts = [];

    $scope.invoiceType = $state.current.data.invoiceType;

    $scope.INVOICE_TYPE = INVOICE_TYPE;

    $scope.createInvoice = createInvoice;
    $scope.setInvoiceDue = setInvoiceDue;
    $scope.setReceiptRead = setReceiptRead;

    $scope.$on('$stateChangeStart',
      function(event, toState) {
        if(toState.name.indexOf('invoice')== 0) {
          $scope.invoiceType = toState.data.invoiceType;
          selectInvoiceType(toState.data.invoiceType);
        }
      });

    init("Victoria Ott");

    function init(doctor) {
      $scope.doctor = doctor;

      patientService.getPatients()
        .then(function(patients) {
          // reference needed for reloading of old invoices
          $scope.patients = patients;

          extractInvoices(patients, doctor);
          extractReceipts(patients, doctor);

          extractOldInvoices(patients, doctor)
            .then(function() {
              selectInvoiceType($state.current.data.invoiceType);
            });
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
            previousState: $state.current.name
          });
        }, function(err) {
          console.error("Could not get patient by id: ");
          console.error(err);
        });
    };

    /**
     *
     *
     * @param invoiceType
     */
    function selectInvoiceType(invoiceType) {

      if(invoiceType == INVOICE_TYPE.due) {
        $scope.selectedInvoices = $scope.dueInvoices;
      }
      else if(invoiceType == INVOICE_TYPE.open) {
        $scope.selectedInvoices = $scope.openInvoices;
      }
      else if(invoiceType == INVOICE_TYPE.receipt) {
        $scope.selectedInvoices = $scope.openReceipts;
      }
      else if(invoiceType == INVOICE_TYPE.old) {
        $scope.selectedInvoices = $scope.oldInvoices;
      }
    }

    /**
     *
     *
     * @param patients
     * @param doctor
     */
    function extractReceipts(patients, doctor) {

      patients.forEach(function(patient) {

        if (patient.treatments) {
          var treatmentsWithReceipt = patient.treatments.filter(function (treatment) {
            var isTreatedByDoctor = !doctor || doctor && treatment['doctor'] == doctor;
            var isOfTypeReceipt = treatment['payment'] == "Quittung";
            var receiptIsOpen = !treatment['closed'];

            return isTreatedByDoctor && isOfTypeReceipt && receiptIsOpen;
          }).map(function (treatment) {
            return {
              patient: patient,
              amount: treatment.amount,
              treatments: [treatment]
            };
          });

          $scope.openReceipts = $scope.openReceipts.concat(treatmentsWithReceipt).sort(receiptSort);
        }
      });
    }

    /**
     *
     *
     * @param patients
     * @param doctor
     */
    function extractOldInvoices(patients, doctor) {

      return invoiceService.getInvoices()
        .then(function(invoices) {

          $scope.oldInvoices = invoices.filter(function(invoice) {
            return invoice.doctor == doctor;
          }).map(function(invoice) {
              var patient = getPatientforInvoice(invoice.patientId);

              return {
                date: invoice.date,
                patient: patient,
                amount: invoice.invoice_amount,
                treatments: getTreatmentsForPatient(patient, invoice.invoice_positions)
              }
            }).sort(invoiceSort);
        });

      function getPatientforInvoice(patientId) {
        return patients.filter(function(patient) {
          return patient._id == patientId;
        })[0];
      }

      function getTreatmentsForPatient(patient, positions) {
        if(!patient || !patient.hasOwnProperty('treatments')) return [];

        return patient.treatments.filter(function(treatment) {
          return positions.indexOf(treatment.id) != -1;
        }).sort(treatmentSort);
      }
    }

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

      $scope.openInvoices.sort(invoiceSort);
      $scope.dueInvoices.sort(invoiceSort);
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
            return openLiability;
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
            return dueLiability;
          })
        });
      }
    }

    /**
     *
     *
     * @param a
     * @param b
     * @returns
     */
    function invoiceSort(a, b) {
      var aDate = a.date ? new Date(a.date) : new Date(a.treatments[0].date);
      var bDate = b.date ? new Date(b.date) : new Date(b.treatments[0].date);

      if(aDate.getDate() == bDate.getDate() && aDate.getMonth() == bDate.getMonth() && aDate.getYear() == bDate.getYear()) {
        if(a.patient.lastname > b.patient.lastname)
          return 1;
        if(a.patient.lastname < b.patient.lastname)
          return -1;

        return 0;
      }

      return bDate - aDate;
    }

    /**
     *
     *
     * @param a
     * @param b
     * @returns number
     */
    function receiptSort(a, b) {
      var aDate = new Date(a.treatments[0].date);
      var bDate = new Date(b.treatments[0].date);

      if(aDate.getDate() == bDate.getDate() && aDate.getMonth() == bDate.getMonth() && aDate.getYear() == bDate.getYear()) {
        if(a.patient.lastname > b.patient.lastname)
          return 1;
        if(a.patient.lastname < b.patient.lastname)
          return -1;

        return 0;
      }

      return bDate - aDate;
    }

    /**
     *
     *
     * @param a
     * @param b
     * @returns number
     */
    function treatmentSort(a, b) {
      return new Date(a.date) - new Date(b.date);
    }

    /**
     *
     *
     * @param invoice
     */
    function createInvoice(invoice, old) {

      var patient = invoice.patient;
      var amount = invoice.amount;
      var treatments = invoice.treatments;

      // create temp directory if not available
      var path = os.tmpdir();
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
              var template = getSuitableTemplate(templates, patient.insurance.type);
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
              if(!old) {
                createInvoiceRecord(patient, treatments, invoice);
                extractOldInvoices($scope.patients, $scope.doctor);
              }
            }, function () { })
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

    /**
     *
     *
     * @param invoice
     */
    function setInvoiceDue(invoice) {

      // set postpone to false
      var oldTreatmentDoc = JSON.parse(JSON.stringify(invoice.treatments[invoice.treatments.length - 1]));
      oldTreatmentDoc.date = new Date(oldTreatmentDoc.date); // Date object must be re-initialized

      var newTreatmentDoc = JSON.parse(JSON.stringify(invoice.treatments[invoice.treatments.length - 1]));
      newTreatmentDoc.date = new Date(newTreatmentDoc.date); // Date object must be re-initialized
      newTreatmentDoc.postpone = false;

      patientService.updateTreatment(invoice.patient._id, oldTreatmentDoc, newTreatmentDoc)
        .then(function() {
          $scope.dueInvoices.push(invoice);
          $scope.openInvoices.splice($scope.openInvoices.indexOf(invoice), 1);
        }, function(err) {
          console.error(err);
        });
    }

    /**
     *
     *
     * @param invoice
     */
    function setReceiptRead(invoice) {

      // set closed to true
      var oldTreatmentDoc = JSON.parse(JSON.stringify(invoice.treatments[0]));
      oldTreatmentDoc.date = new Date(oldTreatmentDoc.date); // Date object must be re-initialized

      var newTreatmentDoc = JSON.parse(JSON.stringify(invoice.treatments[0]));
      newTreatmentDoc.date = new Date(newTreatmentDoc.date); // Date object must be re-initialized
      newTreatmentDoc.closed = true;

      patientService.updateTreatment(invoice.patient._id, oldTreatmentDoc, newTreatmentDoc)
        .then(function() {
          $scope.openReceipts.splice($scope.openReceipts.indexOf(invoice), 1);
        }, function(err) {
          console.error(err);
        });
    }
  }
})(window.moment);