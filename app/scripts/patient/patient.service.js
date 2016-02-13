(function () {

  'use strict';

  var Datastore = require('nedb');

  angular
    .module('app.patient')
    .service('patientService', ['$rootScope', '$q', 'storageService', PatientService]);

  function PatientService($rootScope, $q, storageService) {

    // Create NeDB database containers
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

    /**
     *
     *
     * @returns {*}
     */
    function getPatients() {
      var deferred = $q.defer();

      patientStore.find({}, function (err, docs) {
        if (err) deferred.reject(err);

        deferred.resolve(docs);
      });

      return deferred.promise;
    }

    /**
     *
     *
     * @param patientId
     * @returns {*}
     */
    function getPatientById(patientId) {
      var deferred = $q.defer();

      patientStore.find({_id: patientId}, function (err, docs) {
        if (err) deferred.reject(err);

        deferred.resolve(docs[0]);
      });

      return deferred.promise;
    }

    /**
     *
     *
     * @param patient
     * @returns {*|promise}
       */
    function createPatient(patient) {
      var deferred = $q.defer();

      patientStore.insert(patient, function (err, newDoc) {
        // newDoc is the newly inserted document, including its _id
        if (err) deferred.reject(err);

        deferred.resolve(newDoc);
      });

      return deferred.promise;
    }

    /**
     *
     *
     * @param id
     * @param treatment
     * @returns {*|promise}
       */
    function addTreatment(id, treatment) {
      var deferred = $q.defer();

      // $push inserts new elements at the end of the array
      patientStore.update({ _id: id }, { $push: { treatments: treatment } }, {}, function (err) {
        if (err) deferred.reject(err);

        deferred.resolve();
      });

      return deferred.promise;
    }

    /**
     *
     *
     * @param patientId
     * @param oldTreatment
     * @param newTreatment
     * @returns {*|promise}
       */
    function updateTreatment(patientId, oldTreatment, newTreatment) {
      var deferred = $q.defer();

      patientStore.find({ _id: patientId}, function (err, docs) {
        if (err) {
          deferred.reject(err);
          return;
        }

        var patient = docs[0];

        patient.treatments.splice(patient.treatments.indexOf(oldTreatment));
        patient.treatments.push(newTreatment);

        patientStore.update({ _id: patientId }, patient, { }, function (err) {
          if (err) {
            deferred.reject(err);
            return;
          }

          deferred.resolve();
        });
      });

      return deferred.promise;
    }

    /**
     *
     *
     * @param id
     * @returns {*}
     */
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

    /**
     *
     *
     * @param id
     * @param patientDoc
     * @returns {*}
     */
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