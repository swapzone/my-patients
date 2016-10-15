(function () {

  'use strict';

  var Datastore = require('nedb');
  var fs = require('fs');

  angular
    .module('app.invoice')
    .service('invoiceService', invoiceService);

  /* @ngInject */
  function invoiceService($log, $rootScope, $q, storageService) {
    const service = this;

    // Create NeDB database containers
    var invoiceStore = new Datastore({
      filename: storageService.getUserDataDirectory('accounting.db'),
      autoload: true,
      onload: function(err) {
        if(err && err.indexOf("the data file is corrupt") > -1) {
          console.log("Database is corrupt.");

          fs.readFile(storageService.getUserDataDirectory('accounting.db'), 'utf8', function (err, data) {
            if (err) {
              return console.error("Database cannot be read: " + err);
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

    //
    // Service API
    //
    service.getInvoices = getInvoices;
    service.createInvoice = createInvoice;
  }
})();