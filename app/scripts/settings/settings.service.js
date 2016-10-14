(function () {

  'use strict';

  var Datastore = require('nedb');

  angular
    .module('app.settings')
    .service('settingsService', settingsService);

  /* @ngInject */
  function settingsService($rootScope, $q, storageService) {

    // Create NeDB database containers
    //var settingsStore = new Datastore({ filename: __dirname + '/data/settings.db', autoload: true });
    var settingsStore = new Datastore({ filename: storageService.getUserDataDirectory('settings.db'), autoload: true });

    $rootScope.$on('backupRestored', function () {
      settingsStore.loadDatabase();
    });

    return {
      getUsers: getUsers,
      deleteUser: deleteUser,
      addUser: addUser,
      getInvoiceTemplates: getInvoiceTemplates,
      deleteInvoiceTemplate: deleteInvoiceTemplate,
      addInvoiceTemplate: addInvoiceTemplate
    };

    function getUsers() {
      var deferred = $q.defer();

      settingsStore.find({ key: 'user' }, function (err, docs) {
        if (err) deferred.reject(err);

        deferred.resolve(docs);
      });

      return deferred.promise;
    }

    function deleteUser(id) {
      var deferred = $q.defer();

      // Remove one document from the collection
      // options set to {} since the default for multi is false
      settingsStore.remove({ key: 'user', _id: id }, {}, function (err, numRemoved) {
        if (err) deferred.reject(err);

        deferred.resolve(numRemoved);
      });

      return deferred.promise;
    }

    function addUser(user) {
      var deferred = $q.defer();

      user.key = 'user';

      settingsStore.find({ key: 'user', name: user.name }, function (err, docs) {
        if (err) deferred.reject(err);

        if(docs.length == 0) {
          settingsStore.insert(user, function (err, newDoc) {
            // newDoc is the newly inserted document, including its _id
            if (err) deferred.reject(err);

            deferred.resolve(newDoc);
          });
        }
        else {
          deferred.reject("Der Nutzername ist bereits vergeben.");
        }
      });

      return deferred.promise;
    }

     function getInvoiceTemplates() {
      var deferred = $q.defer();

      settingsStore.find({ key: 'template' }, function (err, docs) {
        if (err) deferred.reject(err);

        deferred.resolve(docs);
      });

      return deferred.promise;
    }

    function deleteInvoiceTemplate(id) {
      var deferred = $q.defer();

      // Remove one document from the collection
      // options set to {} since the default for multi is false
      settingsStore.remove({ key: 'template', _id: id }, {}, function (err, numRemoved) {
        if (err) deferred.reject(err);

        deferred.resolve(numRemoved);
      });

      return deferred.promise;
    }

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
  }
})();