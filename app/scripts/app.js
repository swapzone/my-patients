(function () {
  'use strict';

  var Datastore = require('nedb');

  angular
    .module('app', [
      'app.index',
      'app.patient',
      'app.invoice',
      'app.settings',
      'app.templates'
    ])
    .config(routeConfig);

  function routeConfig($stateProvider, $urlRouterProvider) {

    $urlRouterProvider.otherwise("/patient/list");

    $stateProvider.state('root', {
      abstract: true,
      template: '<div ui-view></div>',
      resolve: {
        appData: loadData
      }
    });
  }

  function loadData($q) {

    // for testing purposes only
    /*
    var db = new Datastore({ filename: 'data/patients.db', autoload: true });

    var doc1 = {
      name: 'Sascha',
      birthday: new Date(),
      privateInsurance: true,
      notthere: null,
      notToBeSaved: undefined,  // Will not be saved
      fruits: [ 'guy', 'nice', 'cool' ],
      infos: { name: 'nedb' }
    };

    var doc2 = {
      name: 'Mareike',
      birthday: new Date(),
      privateInsurance: true,
      notthere: null,
      notToBeSaved: undefined,  // Will not be saved
      fruits: [ 'girl', 'nice', 'cool' ],
      infos: { name: 'nedb' }
    };

    var deferred = $q.defer();

    db.insert([doc1, doc2], function (err, newDoc) {   // Callback is optional
      // newDoc is the newly inserted document, including its _id
      deferred.resolve(newDoc);
    });

    return deferred;
    */
  }
})();