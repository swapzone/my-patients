(function () {

  'use strict';

	const Datastore = require('nedb');

  angular
    .module('app.patient')
    .service('patientService', PatientService);

  /* @ngInject */
  function PatientService($log, $rootScope, $q, storageService) {
    const service = this;

    service.patients = [];

    // Create NeDB database containers
		const patientStore = new Datastore({ filename: storageService.getUserDataDirectory('patients.db'), autoload: true });

    $rootScope.$on('backupRestored', function () {
      patientStore.loadDatabase();
      initializePatients(true);
    });

    /**
     * Retrieve all patients from database or cache.
     *
     * @param force
     * @returns {*}
     */
    function initializePatients(force) {
			const deferred = $q.defer();

      if (service.patients.length && !force) {
        deferred.resolve();
      }
      else {
        patientStore.find({}, function (err, docs) {
          if (err) deferred.reject(err);

          service.patients = docs;
          deferred.resolve();
        });
      }

      return deferred.promise;
    }

    /**
     * Get patient from database by patientId.
     *
     * @param patientId
     * @returns {*}
     */
    function getPatientById(patientId) {
			const deferred = $q.defer();

      if (service.patients.length) {
        // load from cache
        deferred.resolve(service.patients.filter((patient) => {
          return patient._id === patientId;
        })[0]);
      }
      else {
        patientStore.find({_id: patientId}, function (err, docs) {
          if (err) deferred.reject(err);

          deferred.resolve(docs[0]);
        });

      }

      return deferred.promise;
    }

    /**
     * Create new patient in database and add to patient list.
     *
     * @param patient
     * @returns {*}
       */
    function createPatient(patient) {
			const deferred = $q.defer();

      patientStore.insert(patient, function (err, newDoc) {
        // newDoc is the newly inserted document, including its _id
        if (err) deferred.reject(err);

        if (service.patients) {
          service.patients.push(newDoc);
        }
        deferred.resolve(newDoc);
      });

      return deferred.promise;
    }

    /**
     * Add a new treatment to a patient.
     *
     * @param patientId
     * @param treatment
     * @returns {*|promise}
       */
    function addTreatment(patientId, treatment) {
			const deferred = $q.defer();

      // $push inserts new elements at the end of the array
      patientStore.update({ _id: patientId }, { $push: { treatments: treatment } }, {}, function (err) {
        if (err) {
          $log.error(err);
          return deferred.reject(err);
        }

        // update cached version
        for (let i=0; i<service.patients.length; i++) {
          if (service.patients[i]._id === patientId) {
            service.patients[i].treatments.push(treatment);
            break;
          }
        }

        deferred.resolve();
      });

      return deferred.promise;
    }

    /**
     * Update treatment for patient with given patientId.
     *
     * @param patientId
     * @param treatmentId
     * @param newTreatment
     * @returns {*|promise}
       */
    function updateTreatment(patientId, treatmentId, newTreatment) {
			const deferred = $q.defer();

      let patientIndex = -1;
      service.patients.some((patient, elementIndex) => {
        if (patient._id === patientId) {
          patientIndex = elementIndex;
          return true;
        }
        return false;
      });

      let patient = service.patients[patientIndex];

      let treatmentIndex = -1;
      patient.treatments.some((treatment, elementIndex) => {
        if (treatment.id === treatmentId) {
          treatmentIndex = elementIndex;
          return true;
        }
        return false;
      });

      patient.treatments.splice(treatmentIndex, 1, newTreatment);

      patientStore.update({ _id: patientId }, patient, { }, function (err) {
        if (err) {
          deferred.reject(err);
          return;
        }

        // update cached version
        // for (let i=0; i<service.patients.length; i++) {
        //   if (service.patients[i]._id === patientId) {
        //     service.patients[i].treatments = patient.treatments;
        //     break;
        //   }
        // }

        deferred.resolve();
      });

      return deferred.promise;
    }

    /**
     * Delete patient from database.
     *
     * @param patientId
     * @returns {*}
     */
    function deletePatient(patientId) {
			const deferred = $q.defer();

      // Remove one document from the collection
      // options set to {} since the default for multi is false
      patientStore.remove({ _id: patientId }, {}, function (err, numRemoved) {
        if (err) deferred.reject(err);

        // update cached version
        for (let i=0; i<service.patients.length; i++) {
          if (service.patients[i]._id === patientId) {
            service.patients.splice(i, 1);
            break;
          }
        }

        deferred.resolve(numRemoved);
      });

      return deferred.promise;
    }

    /**
     * Update patient data in database.
     *
     * @param patientId
     * @param patientDoc
     * @returns {*}
     */
    function updatePatient(patientId, patientDoc) {
      const deferred = $q.defer();

      // Replace a document by another
      patientStore.update({ _id: patientId }, patientDoc, {}, function (err, numReplaced) {
        // Note that the _id is kept unchanged, and the document has been replaced
        if (err) return deferred.reject(err);

        // update cached version
        for (let i=0; i<service.patients.length; i++) {
          if (service.patients[i]._id === patientId) {
            service.patients.splice(i, 1, patientDoc);
            break;
          }
        }

        deferred.resolve(numReplaced);
      });

      return deferred.promise;
    }

    //
    // Service API
    //
    service.initializePatients = initializePatients;
    service.getPatientById = getPatientById;
    service.createPatient = createPatient;
    service.addTreatment = addTreatment;
    service.updateTreatment = updateTreatment;
    service.deletePatient = deletePatient;
    service.updatePatient = updatePatient;
  }
})();