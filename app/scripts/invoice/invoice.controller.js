(function (moment) {

  'use strict';

  var fs = require('fs');
  var os = require('os');
  var Docxtemplater = require('docxtemplater');

  angular
    .module('app.invoice')
    .controller('InvoiceController', InvoiceController);

  /* @ngInject */
  function InvoiceController($log, $scope, $stateParams, $state, $mdDialog, INVOICE_TYPE, loginService, patientService, settingsService, invoiceService) {
    const vm = this;

    vm.selectedInvoices = undefined;

    vm.openInvoices = [];
    vm.dueInvoices = [];
    vm.oldInvoices = [];
    vm.openReceipts = [];

    vm.INVOICE_TYPE = INVOICE_TYPE;

    vm.invoiceType = $stateParams.type % 1 === 0 ? parseInt($stateParams.type, 10) : undefined;

    vm.createInvoice = createInvoice;
    vm.setInvoiceDue = setInvoiceDue;
    vm.setReceiptRead = setReceiptRead;
    
    vm.$onInit = () => {
      vm.doctor = loginService.activeUser().name;
      vm.patients = patientService.patients;

      vm.dueInvoices = invoiceService.extractDueInvoices(vm.patients, vm.doctor);
      vm.openInvoices = invoiceService.extractOpenInvoices(vm.patients, vm.doctor);
      vm.openReceipts = invoiceService.extractReceipts(vm.patients, vm.doctor);

      invoiceService.extractOldInvoices(vm.patients, vm.doctor)
        .then(function(oldInvoices) {
          vm.oldInvoices = oldInvoices;
          selectInvoiceType(parseInt($stateParams.type, 10));
        });
    };

    /**
     * Go to patient details view.
     *
     * @param patientId
     */
    vm.goToPatientDetails = function(patientId) {
      $state.go("patient.details", {
        patientId: patientId,
        previousState: $state.current.name
      });
    };

    /**
     * Set an invoice type as selected.
     *
     * @param invoiceType
     */
    function selectInvoiceType(invoiceType) {

      if(invoiceType === INVOICE_TYPE.due) {
        vm.selectedInvoices = vm.dueInvoices;
      }
      else if(invoiceType === INVOICE_TYPE.open) {
        vm.selectedInvoices = vm.openInvoices;
      }
      else if(invoiceType === INVOICE_TYPE.receipt) {
        vm.selectedInvoices = vm.openReceipts;
      }
      else if(invoiceType === INVOICE_TYPE.old) {
        vm.selectedInvoices = vm.oldInvoices;
      }
    }

    /**
     * Check of temp folder is available, then start creation of invoice.
     *
     * @param invoice
     * @param old
     */
    function createInvoice(invoice, old) {
      // create temp directory if not available
      var path = os.tmpdir();
      fs.exists(path, function(exists) {
        if (!exists) {
          fs.mkdir(path, function() {
            createDocument(invoice, old);
          });
        }
        else {
          createDocument(invoice, old);
        }
      });
    }

    /**
     * Create a new invoice document.
     *
     * @param invoice
     * @param old
     */
    function createDocument(invoice, old) {
      settingsService.getInvoiceTemplates()
        .then(function (templates) {
          const userId = loginService.activeUser()._id;
          templates = templates.filter((template => template.user === userId));
          vm.templates = templates;

          var templateFile;
          if (invoice.patient.insurance) {
            var template = invoiceService.getSuitableTemplate(templates, invoice.patient.insurance.type);
            if (template && template.hasOwnProperty("file")) {
              templateFile = template.file;
            }
          }

          if (!templateFile) {
            // ask user which template to use
            var dialogObject = {
              controller: 'InvoiceTemplateController',
              controllerAs: 'vm',
              scope: $scope.$new(),
              templateUrl: 'app/templates/invoice/template/template.html',
              parent: angular.element(document.body),
              clickOutsideToClose: false,
              locals: {
                items: templates
              }
            };

            $mdDialog.show(dialogObject)
              .then(function (templateFile) {

                if(templateFile) {
                  createDocumentWithTemplate(templateFile, invoice, old);
                }
                else {
                  $log.warn("Could not select template file.");
                }
              }, function () {})
              .finally(function() {
                dialogObject = undefined;
              });
          }
          else {
            createDocumentWithTemplate(templateFile, invoice, old);
          }
        });
    }

    /**
     * Create the invoice document with the given template content.
     *
     * @param templateContent
     * @param invoice
     * @param old
     */
    function createDocumentWithTemplate(templateContent, invoice, old) {
      let patient = invoice.patient;
      let treatments = invoice.treatments;
      let amount = invoice.amount;

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

      fs.writeFileSync(os.tmpdir() + "/invoice.docx", buffer);

      var date = moment().format('YYYY');
      var documentName = patient.lastname + ", " + patient.firstname + " " + date + "-XXX.docx";
      triggerDownload(os.tmpdir() + "/invoice.docx", documentName);

      // show invoice details in popup before writing data to database
      var dialogObject = {
        controller: 'InvoicePositionsController',
        controllerAs: 'vm',
        scope: $scope.$new(),
        templateUrl: 'app/templates/invoice/positions/positions.html',
        parent: angular.element(document.body),
        clickOutsideToClose: false,
        locals: {
          items: treatments
        }
      };

      $mdDialog.show(dialogObject)
        .then(function () {
          if(!old) {
            createInvoiceRecord(patient, treatments, invoice, amount);
            invoiceService.extractOldInvoices(vm.patients, vm.doctor)
              .then(function(oldInvoices) {
                vm.oldInvoices = oldInvoices;
              });
          }
        }, function () { })
        .finally(function() {
          dialogObject = undefined;
        });
    }

    /**
     * Create a new invoice record in the database.
     *
     * @param patient
     * @param treatments
     * @param invoice
     * @param amount
     */
    function createInvoiceRecord(patient, treatments, invoice, amount) {

      // write invoice data set to database
      invoiceService.createInvoice({
        date: new Date(),
        patientId: patient._id,
        invoice_positions: treatments.map(function(treatment) {
          return treatment.id;
        }),
        invoice_amount: amount,
        doctor: vm.doctor
      });

      patient['last_invoiced'] = {
        date: new Date(treatments[treatments.length - 1].date),
        doctor: vm.doctor
      };
      patientService.updatePatient(patient._id, patient);

      // delete invoice from invoices array
      var invoiceIndex = vm.dueInvoices.indexOf(invoice);
      if(invoiceIndex > -1)
        vm.dueInvoices.splice(invoiceIndex, 1);
      else {
        invoiceIndex = vm.openInvoices.indexOf(invoice);

        if(invoiceIndex > -1)
          vm.openInvoices.splice(invoiceIndex, 1);
      }
    }

    /**
     * Trigger the download of the invoice document.
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

    /**
     * Move the invoice to due section.
     *
     * @param invoice
     */
    function setInvoiceDue(invoice) {

      // set postpone to false
      let treatmentId = invoice.treatments[invoice.treatments.length - 1].id;

      var newTreatmentDoc = JSON.parse(JSON.stringify(invoice.treatments[invoice.treatments.length - 1]));
      newTreatmentDoc.date = new Date(newTreatmentDoc.date); // Date object must be re-initialized
      newTreatmentDoc.postpone = false;

      patientService.updateTreatment(invoice.patient._id, treatmentId, newTreatmentDoc)
        .then(function() {
          vm.dueInvoices.push(invoice);
          vm.openInvoices.splice(vm.openInvoices.indexOf(invoice), 1);
        }, function(err) {
          $log.error(err);
        });
    }

    /**
     * Hide the receipt from invoicing.
     *
     * @param invoice
     */
    function setReceiptRead(invoice) {

      // set closed to true
      let treatmentId = invoice.treatments[0].id;

      var newTreatmentDoc = JSON.parse(JSON.stringify(invoice.treatments[0]));
      newTreatmentDoc.date = new Date(newTreatmentDoc.date); // Date object must be re-initialized
      newTreatmentDoc.closed = true;

      patientService.updateTreatment(invoice.patient._id, treatmentId, newTreatmentDoc)
        .then(function() {
          vm.openReceipts.splice(vm.openReceipts.indexOf(invoice), 1);
        }, function(err) {
          $log.error(err);
        });
    }
  }
})(window.moment);