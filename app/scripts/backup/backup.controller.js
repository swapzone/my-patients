(function () {

  'use strict';

  var fs = require('fs');
  var archiver = require('archiver');
  var moment = require('moment');

  angular
    .module('app.backup')
    .controller('backupCtrl', ['$scope', BackupController]);

  function BackupController($scope) {
    $scope.backupFile = null;

    $scope.createBackupFile = createBackupFile;
    $scope.restoreBackup = restoreBackup;

    /**
     *
     */
    function createBackupFile() {
      var archive = archiver.create('zip', {});

      var path = __dirname + '/temp';
      fs.exists(path, function(exists) {
        if (!exists) {
          fs.mkdir(path, function() {
            createArchive();
          });
        }
        else {
          createArchive();
        }
      });

      /**
       *
       */
      function createArchive() {

        var fileName = "backup_" + moment().format("YYYYMMDD_hhmm") + ".zip";
        var output = fs.createWriteStream(path + '/' + fileName);

        output.on('close', function() {
          var downloadLink = angular.element('<a></a>');
          downloadLink.attr('href', path + '/' + fileName);
          downloadLink.attr('download', fileName);
          downloadLink[0].click();
        });

        archive.on('error', function(err) {
          console.error(err);
        });

        archive.pipe(output);

        archive
          .directory('data', false, { date: new Date() })
          .finalize();
      }
    }

    /**
     *
     */
    function restoreBackup() {

      if($scope.backupFile) {
        $scope.error = "";

        alert("Noch nicht implementiert.");
      }
      else {
        $scope.error = "Es muss zuerst eine Sicherungsdatei ausgewählt werden.";
      }
    }
  }
})();