(function () {

  'use strict';

  var Datastore = require('nedb');

  angular
    .module('app.patient')
    .service('patientService', ['$q', PatientService]);

  function PatientService($q) {

    // Create NeDB database containers
    var patientStore = new Datastore({ filename: 'data/patients.db', autoload: true });

    return {
      getPatients: getPatients,
      create: createPatient,
      delete: deletePatient,
      update: updatePatient
    };

    function getPatients() {
      var deferred = $q.defer();

      patientStore.find({}, function (err, docs) {
        deferred.resolve(docs);
      });

      return deferred.promise;
    }

    function createPatient(patient) {
      var deferred = $q.defer();

      patientStore.insert(patient, function (err, newDoc) {
        // newDoc is the newly inserted document, including its _id
        if (err) deferred.reject(err);

        deferred.resolve(newDoc._id);
      });

      return deferred.promise;
    }

    function deletePatient(id) {
      var deferred = $q.defer();
      var query = "DELETE FROM customers WHERE customer_id = ?";

      //connection.query(query, [id], function (err, res) {
      //  if (err) deferred.reject(err);
      //  deferred.resolve(res.affectedRows);
      //});
      return deferred.promise;
    }

    function updatePatient(patient) {
      var deferred = $q.defer();
      var query = "UPDATE customers SET name = ? WHERE customer_id = ?";

      //connection.query(query, [customer.name, customer.customer_id], function (err, res) {
      //  if (err) deferred.reject(err);
      //  deferred.resolve(res);
      //});
      return deferred.promise;
    }
  }
})();