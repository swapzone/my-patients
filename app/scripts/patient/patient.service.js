(function () {

  'use strict';

  // Create NeDB database connection
  var connection;

  angular
    .module('app.patient')
    .service('patientService', ['$q', PatientService]);

  function PatientService($q) {
    return {
      getPatients: getPatients,
      getById: getPatientById,
      getByName: getPatientByName,
      create: createPatient,
      destroy: deletePatient,
      update: updatePatient
    };

    function getPatients() {
      var deferred = $q.defer();
      var query = "SELECT * FROM customers";

      //connection.query(query, function (err, rows) {
      //  if (err) deferred.reject(err);
      //  deferred.resolve(rows);
      //});
      return deferred.promise;
    }

    function getPatientById(id) {
      var deferred = $q.defer();
      var query = "SELECT * FROM customers WHERE customer_id = ?";

      //connection.query(query, [id], function (err, rows) {
      //  if (err) deferred.reject(err);
      //  deferred.resolve(rows);
      //});
      return deferred.promise;
    }

    function getPatientByName(name) {
      var deferred = $q.defer();
      var query = "SELECT * FROM customers WHERE name LIKE  '" + name + "%'";

      //connection.query(query, [name], function (err, rows) {
      //  if (err) deferred.reject(err);
      //
      //  deferred.resolve(rows);
      //});
      return deferred.promise;
    }

    function createPatient(customer) {
      var deferred = $q.defer();
      var query = "INSERT INTO customers SET ?";

      //connection.query(query, customer, function (err, res) {
      //  if (err) deferred.reject(err);
      //  deferred.resolve(res.insertId);
      //});
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

    function updatePatient(customer) {
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