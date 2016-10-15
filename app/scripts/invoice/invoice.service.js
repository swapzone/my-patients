(function () {

  'use strict';

  var Datastore = require('nedb');
  var fs = require('fs');

  angular
    .module('app.invoice')
    .service('invoiceService', invoiceService);

  /* @ngInject */
  function invoiceService($log, $rootScope, $q, storageService, INSURANCE_TYPE) {
    const service = this;

    // Create NeDB database containers
    var invoiceStore = new Datastore({
      filename: storageService.getUserDataDirectory('accounting.db'),
      autoload: true,
      onload: function(err) {
        if(err && err.indexOf("the data file is corrupt") > -1) {
          $log.warn("Database is corrupt.");

          fs.readFile(storageService.getUserDataDirectory('accounting.db'), 'utf8', function (err, data) {
            if (err) {
              return $log.error("Database cannot be read: " + err);
            }

            if(data.trim().length === 0) {
              $log.debug("Database is empty, can be reset.");

              fs.truncate(storageService.getUserDataDirectory('accounting.db'), 0, function() {
                $log.info('Database was reset.');
                invoiceStore.loadDatabase();
              });
            }
            else {
              $log.error("Database is not empty. Cannot be reset.");
            }
          });
        }
      }});

    $rootScope.$on('backupRestored', function () {
      invoiceStore.loadDatabase();
    });

    /**
     * Retrieve all invoices from database.
     *
     * @returns {*}
     */
    let getInvoices = () => {
      let deferred = $q.defer();

      invoiceStore.find({}, function (err, docs) {
        if (err) deferred.reject(err);

        deferred.resolve(docs);
      });

      return deferred.promise;
    };

    /**
     * Add invoice to database.
     *
     * @param invoice
     * @returns {*}
     */
    let createInvoice = (invoice) => {
      let deferred = $q.defer();

      invoiceStore.insert(invoice, function (err, newDoc) {
        // newDoc is the newly inserted document, including its _id
        if (err) deferred.reject(err);

        deferred.resolve(newDoc);
      });

      return deferred.promise;
    };

    /**
     * Extract all receipts for the given doctor.
     *
     * @param patients
     * @param doctor
     * @returns {*}
     */
    function extractReceipts(patients, doctor) {
      let receipts = [];

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

          receipts = receipts.concat(treatmentsWithReceipt).sort(receiptSort);
        }
      });

      return receipts;
    }

    /**
     * Get all old invoices for the given doctor.
     *
     * @param patients
     * @param doctor
     */
    function extractOldInvoices(patients, doctor) {

      return getInvoices()
        .then(function(invoices) {
          return invoices.filter(function(invoice) {
            return invoice.doctor === doctor;
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
     * Get all due invoices for the given doctor.
     *
     * @param patients
     * @param doctor
     */
    function extractDueInvoices(patients, doctor) {
      let dueInvoices = [];

      patients.forEach(function(patient) {
        if(patient.treatments) {
          var treatments = patient.treatments.filter(function (treatment) {

            var isTreatedByDoctor = !doctor || doctor && treatment['doctor'] == doctor;
            var isOfTypeInvoice = treatment['payment'] == "Rechnung";

            return isTreatedByDoctor && isOfTypeInvoice;
          });

          if (patient.hasOwnProperty("last_invoiced") && patient['last_invoiced'].doctor === doctor) {
            var lastInvoicedDate = new Date(patient['last_invoiced'].date);

            treatments = treatments.filter(function (treatment) {
              var treatmentDate = new Date(treatment.date);
              return treatmentDate > lastInvoicedDate;
            });
          }

          if (treatments && treatments.length) {
            treatments.sort(treatmentSort);
            var result = classifyInvoice(patient, treatments);

            if (result.dueInvoices.length) {
              dueInvoices = dueInvoices.concat(result.dueInvoices);
            }
          }
        }
      });

      return dueInvoices.sort(invoiceSort);
    }

    /**
     * Get all open invoices for the given doctor.
     *
     * @param patients
     * @param doctor
     */
    function extractOpenInvoices(patients, doctor) {
      let openInvoices = [];

      patients.forEach(function(patient) {
        if(patient.treatments) {
          var treatments = patient.treatments.filter(function (treatment) {

            var isTreatedByDoctor = !doctor || doctor && treatment['doctor'] == doctor;
            var isOfTypeInvoice = treatment['payment'] == "Rechnung";

            return isTreatedByDoctor && isOfTypeInvoice;
          });

          if (patient.hasOwnProperty('last_invoiced') && patient['last_invoiced'].doctor === doctor) {
            var lastInvoicedDate = new Date(patient['last_invoiced'].date);

            treatments = treatments.filter(function (treatment) {
              var treatmentDate = new Date(treatment.date);
              return treatmentDate > lastInvoicedDate;
            });
          }

          if (treatments && treatments.length) {
            treatments.sort(treatmentSort);
            var result = classifyInvoice(patient, treatments);

            if (result.openInvoices.length) {
              openInvoices = openInvoices.concat(result.openInvoices);
            }
          }
        }
      });

      return openInvoices.sort(invoiceSort);
    }

    /**
     *
     *
     * @param patient
     * @param treatments
     */
    function classifyInvoice(patient, treatments) {
      let classificationResult = {
        openInvoices: [],
        dueInvoices: []
      };

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

        classificationResult.openInvoices.push({
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

        classificationResult.dueInvoices.push({
          patient: patient,
          amount: amount,
          treatments: dueLiabilities.map(function(dueLiability) {
            return dueLiability;
          })
        });
      }

      return classificationResult;
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
     * Get template for given insuranceType and userId.
     *
     * @param templates
     * @param insuranceType
     * @returns {*}
     */
    function getSuitableTemplate(templates, insuranceType) {

      var defaultTemplate = null;
      var stateTemplate = null;
      var privateTemplate = null;

      templates
        .forEach(function(template) {
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
                $log.warn("Unknown template type in database.");
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


    //
    // Service API
    //
    service.getInvoices = getInvoices;
    service.createInvoice = createInvoice;
    service.extractReceipts = extractReceipts;
    service.extractOldInvoices = extractOldInvoices;
    service.extractDueInvoices = extractDueInvoices;
    service.extractOpenInvoices = extractOpenInvoices;
    service.getSuitableTemplate = getSuitableTemplate;
  }
})();