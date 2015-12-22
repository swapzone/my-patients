(function () {

  'use strict';

  var readLine = require('readline'),
            fs = require('fs'),
     Datastore = require('nedb');

  angular
    .module('app.common')
    .service('postalService', ['$q', PostalService]);

  function PostalService($q) {
    var self = this;
    self.initialized = false;

    // Create NeDB database containers
    var postalStore = new Datastore({ filename: __dirname + '/data/postals.db', autoload: true });

    return {
      getSuggestions: getSuggestions
    };

    /**
     *
     *
     * @param input
     * @returns {*}
     */
    function getSuggestions(input) {
      var deferred = $q.defer();

      init().then(function() {
        var regex = new RegExp('^' + input);

        postalStore.find({ code: { $regex: regex }}, function (err, docs) {
          if (err) deferred.reject(err);

          deferred.resolve(docs);
        });
      });

      return deferred.promise;
    }

    /**
     *
     *
     * @returns {*}
     */
    function init() {
      var deferred = $q.defer();

      if(!self.initialized) {

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
              self.initialized = true;
              deferred.resolve();
            });
          }
          else {
            self.initialized = true;
            deferred.resolve();
          }
        });
      }
      else
        deferred.resolve();

      return deferred.promise;
    }
  }
})();