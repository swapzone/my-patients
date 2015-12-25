(function () {

  'use strict';

  var Datastore = require('nedb');
  var fs = require('fs');

  angular
    .module('app.invoice')
    .service('invoiceService', ['$rootScope', '$q', 'storageService', InvoiceService]);

  function InvoiceService($rootScope, $q, storageService) {

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
              console.log("Database is empty, can be reset.");

              fs.truncate(storageService.getUserDataDirectory('accounting.db'), 0, function() {
                console.log('Database was reset.');
                invoiceStore.loadDatabase();
              });
            }
            else {
              console.error("Database is not empty. Cannot be reset.");
            }
          });
        }
      }});

    $rootScope.$on('backupRestored', function () {
      invoiceStore.loadDatabase();
    });

    return {
      getInvoices: getInvoices,
      createInvoice: createInvoice
    };

    function getInvoices() {
      var deferred = $q.defer();

      invoiceStore.find({}, function (err, docs) {
        if (err) deferred.reject(err);

        deferred.resolve(docs);
      });

      return deferred.promise;
    }

    function createInvoice(invoice) {
      var deferred = $q.defer();

      invoiceStore.insert(invoice, function (err, newDoc) {
        // newDoc is the newly inserted document, including its _id
        if (err) deferred.reject(err);

        deferred.resolve(newDoc);
      });

      return deferred.promise;
    }
  }
})();