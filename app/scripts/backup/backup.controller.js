(function () {

  'use strict';

  var fs = require('fs');
  var archiver = require('archiver');
  var unzip = require('unzip');
  var moment = require('moment');

  angular
    .module('app.backup')
    .controller('backupCtrl', ['$rootScope', '$scope', '$mdDialog', '$state', BackupController]);

  function BackupController($rootScope, $scope, $mdDialog, $state) {
    $scope.backupFile = null;
    $scope.error = "";

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
    function restoreBackup($event) {

      if($scope.backupFile) {
        $scope.error = "";

        var confirm = $mdDialog.confirm()
          .parent(angular.element(document.body))
          .title('Sicher?')
          .content('Willst du die Sicherung wirklich wiederherstellen? Alle aktuell vorhandenen Daten werden überschrieben.')
          .targetEvent($event)
          .ok('Ja')
          .cancel('Oh. Nein!');

        $mdDialog.show(confirm).then(function() {
          confirm = null;

          var path = __dirname + '/temp';
          fs.exists(path, function(exists) {
            if (!exists) {
              fs.mkdir(path, function() {
                loadBackup(path);
              });
            }
            else {
              loadBackup(path);
            }
          });
        }, function() { });
      }
      else {
        $scope.error = "Es muss zuerst eine Sicherungsdatei ausgewählt werden.";
      }
    }

    function loadBackup(path) {
      var filePath = path + '/backup.zip';

      fs.writeFile(filePath, new Buffer($scope.backupFile, 'binary'), function (err) {
        if (err) throw err;

        restoreBackupFile(filePath);
      });
    }

    /**
     *
     */
    function restoreBackupFile(filePath) {

      if($scope.backupFile == null) {
        $scope.error = "Die Sicherungsdatei konnte nicht gelesen werden.";
        return;
      }

      var output = __dirname + '/data';

      fs.createReadStream(filePath)
        .pipe(unzip.Parse())
        .on('entry', function (entry) {
          var fileName = entry.path;
          var type = entry.type;

          if (type == "File" && fileName.indexOf(".db") === fileName.length - 3) {
            entry.pipe(fs.createWriteStream(output + "/" + fileName));
          } else {
            console.error("Wrong file format.");
            entry.autodrain();
          }
        })
        .on('close', function() {
          $mdDialog.show(
            $mdDialog
              .alert()
              .clickOutsideToClose(true)
              .title('Super!')
              .content('Die Wiederherstellung war erfolgreich!')
              .ok('Ok')
          ).then(function() {
            $rootScope.$broadcast('backupRestored');
            $state.go("patient.list", {});
          });
        })
        .on('error', function() {
          $scope.error = "Die Wiederherstellung war leider nicht erfolgreich.";
        });
    }
  }
})();