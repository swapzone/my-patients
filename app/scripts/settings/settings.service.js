(function () {

  'use strict';

  var Datastore = require('nedb');

  angular
    .module('app.settings')
    .service('settingsService', settingsService);

  /* @ngInject */
  function settingsService($rootScope, $q, storageService) {
    const service = this;

    service.users = [];

    // Create NeDB database containers
    var settingsStore = new Datastore({ filename: storageService.getUserDataDirectory('settings.db'), autoload: true });

    $rootScope.$on('backupRestored', function () {
      settingsStore.loadDatabase();
      service.users.splice(0, service.users.length);
      initializeUsers();
    });

    /**
     * Initialize all available users.
     */
    function initializeUsers() {
      var deferred = $q.defer();

      if (service.users.length) {
        deferred.resolve(service.users);
      }
      else {
        settingsStore.find({key: 'user'}, function (err, docs) {
          if (err) deferred.reject(err);

          docs.forEach(doc => {
            service.users.push(doc);
          });

          deferred.resolve();
        });
      }

      return deferred.promise;
    }

    /**
     * Delete user from database.
     *
     * @param userId
     */
    function deleteUser(userId) {
      var deferred = $q.defer();

      // Remove one document from the collection
      // options set to {} since the default for multi is false
      settingsStore.remove({ key: 'user', _id: userId }, {}, function (err, numRemoved) {
        if (err) deferred.reject(err);

        // update cached version
        for (let i=0; i<service.users.length; i++) {
          if (service.users[i]._id === userId) {
            service.users.splice(i, 1);
            break;
          }
        }

        deferred.resolve(numRemoved);
      });

      return deferred.promise;
    }

    /**
     *
     *
     * @param user
     */
    function addUser(user) {
      var deferred = $q.defer();

      user.key = 'user';

      settingsStore.find({ key: 'user', name: user.name }, function (err, docs) {
        if (err) deferred.reject(err);

        if(docs.length == 0) {
          settingsStore.insert(user, function (err, newDoc) {
            // newDoc is the newly inserted document, including its _id
            if (err) deferred.reject(err);

            service.users.push(newDoc);
            deferred.resolve(newDoc);
          });
        }
        else {
          deferred.reject("Der Nutzername ist bereits vergeben.");
        }
      });

      return deferred.promise;
    }

    /**
     *
     */
    function getInvoiceTemplates() {
      var deferred = $q.defer();

      settingsStore.find({ key: 'template' }, function (err, docs) {
        if (err) deferred.reject(err);

        deferred.resolve(docs);
      });

      return deferred.promise;
    }

    /**
     * Delete template with given templateId.
     *
     * @param templateId
     */
    function deleteInvoiceTemplate(templateId) {
      var deferred = $q.defer();

      // Remove one document from the collection
      // options set to {} since the default for multi is false
      settingsStore.remove({ key: 'template', _id: templateId }, {}, function (err, numRemoved) {
        if (err) deferred.reject(err);

        deferred.resolve(numRemoved);
      });

      return deferred.promise;
    }

    /**
     * Add new invoice template to database.
     *
     * @param template
     */
    function addInvoiceTemplate(template) {
      var deferred = $q.defer();

      template.key = 'template';

      settingsStore.insert(template, function (err, newDoc) {
        // newDoc is the newly inserted document, including its _id
        if (err) deferred.reject(err);

        deferred.resolve(newDoc);
      });

      return deferred.promise;
    }

    //
    // Service API
    //
    service.initializeUsers = initializeUsers;
    service.deleteUser = deleteUser;
    service.addUser = addUser;
    service.getInvoiceTemplates = getInvoiceTemplates;
    service.deleteInvoiceTemplate =  deleteInvoiceTemplate;
    service.addInvoiceTemplate = addInvoiceTemplate;
  }
})();