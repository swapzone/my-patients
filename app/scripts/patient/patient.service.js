(function () {

  'use strict';

  var Datastore = require('nedb');

  angular
    .module('app.patient')
    .service('patientService', ['$rootScope', '$q', 'storageService', PatientService]);

  function PatientService($rootScope, $q, storageService) {

    // Create NeDB database containers
    //var patientStore = new Datastore({ filename: __dirname + '/data/patients.db', autoload: true });
    var patientStore = new Datastore({ filename: storageService.getUserDataDirectory('patients.db'), autoload: true });

    $rootScope.$on('backupRestored', function () {
      patientStore.loadDatabase();
    });

    return {
      getPatients: getPatients,
      getPatientById: getPatientById,
      create: createPatient,
      delete: deletePatient,
      update: updatePatient,
      addTreatment: addTreatment,
      updateTreatment: updateTreatment
    };

    function getPatients() {
      var deferred = $q.defer();

      patientStore.find({}, function (err, docs) {
        if (err) deferred.reject(err);

        deferred.resolve(docs);
      });

      return deferred.promise;
    }

    function getPatientById(patientId) {
      var deferred = $q.defer();

      patientStore.find({_id: patientId}, function (err, docs) {
        if (err) deferred.reject(err);

        deferred.resolve(docs[0]);
      });

      return deferred.promise;
    }

    function createPatient(patient) {
      var deferred = $q.defer();

      patientStore.insert(patient, function (err, newDoc) {
        // newDoc is the newly inserted document, including its _id
        if (err) deferred.reject(err);

        deferred.resolve(newDoc);
      });

      return deferred.promise;
    }

    function addTreatment(id, treatment) {
      var deferred = $q.defer();

      // $push inserts new elements at the end of the array
      patientStore.update({ _id: id }, { $push: { treatments: treatment } }, {}, function (err) {
        if (err) deferred.reject(err);

        deferred.resolve();
      });

      return deferred.promise;
    }

    function updateTreatment(patientId, oldTreatment, newTreatment) {
      var deferred = $q.defer();

      patientStore.update({ _id: patientId }, { $pull: { treatments: oldTreatment } }, { }, function (err) {
        if (err) {
          deferred.reject(err);
          return;
        }
        patientStore.update({ _id: patientId }, { $push: { treatments: newTreatment } }, { }, function (err) {
          if (err) {
            deferred.reject(err);
            return;
          }

          deferred.resolve();
        });
      });

      return deferred.promise;
    }

    function deletePatient(id) {
      var deferred = $q.defer();

      // Remove one document from the collection
      // options set to {} since the default for multi is false
      patientStore.remove({ _id: id }, {}, function (err, numRemoved) {
        if (err) deferred.reject(err);

        deferred.resolve(numRemoved);
      });

      return deferred.promise;
    }

    function updatePatient(id, patientDoc) {
      var deferred = $q.defer();

      // Replace a document by another
      patientStore.update({ _id: id }, patientDoc, {}, function (err, numReplaced) {
        // Note that the _id is kept unchanged, and the document has been replaced
        if (err) deferred.reject(err);

        deferred.resolve(numReplaced);
      });

      return deferred.promise;
    }
  }
})();