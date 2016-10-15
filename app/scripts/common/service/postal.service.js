(function () {

  'use strict';

  var readLine = require('readline'),
            fs = require('fs'),
     Datastore = require('nedb');

  angular
    .module('app.common')
    .service('postalService', postalService);

  /* @ngInject */
  function postalService($q, storageService) {
    let service = this;

    service.initialized = false;

    // Create NeDB database containers
    var postalStore = new Datastore({ filename: storageService.getUserDataDirectory('postals.db'), autoload: true });


    /**
     *
     *
     * @param input
     * @param limit
     * @returns {*}
     */
    function getSuggestions(input, limit) {
      var deferred = $q.defer();

      if(!limit) limit = 10;

      init().then(function() {
        var regex = new RegExp('^' + input);

        postalStore.find({ code: { $regex: regex }}, function (err, docs) {
          if (err) deferred.reject(err);

          deferred.resolve(docs.slice(0, limit));
        });
      });

      return deferred.promise;
    }

    /**
     * Initialize postal database.
     *
     * @returns {*}
     */
    function init() {
      var deferred = $q.defer();

      if(!service.initialized) {

        postalStore.find({}, function (err, docs) {
          if (err || docs.length === 0) {

            var lineReader = readLine.createInterface({
              input: fs.createReadStream(__dirname + '/data/postals.txt')
            });

            lineReader.on('line', function (line) {
              var regex = /\t+/g;
              var postalArray = line.split(regex);
              var postalDoc = {
                code: postalArray[0],
                city: postalArray[1]
              };

              postalStore.insert(postalDoc, function (err) {
                if (err) console.error(err);
              });
            });

            lineReader.on('close', function () {
              service.initialized = true;
              deferred.resolve();
            });
          }
          else {
            service.initialized = true;
            deferred.resolve();
          }
        });
      }
      else
        deferred.resolve();

      return deferred.promise;
    }

    //
    // Service API
    //
    service.getSuggestions = getSuggestions;
  }
})();