(function (moment) {
  'use strict';

  var fs = require('fs');
  var os = require('os');
  var Path = require('path');
  var archiver = require('archiver');
  var yauzl = require('yauzl');

  angular
    .module('app.backup')
    .controller('BackupController', BackupController);

  /* @ngInject */
  function BackupController($rootScope, $mdDialog, $state, storageService) {
    const vm = this;
    
    vm.backupFile = null;
    vm.error = "";

    vm.createBackupFile = createBackupFile;
    vm.restoreBackup = restoreBackup;

    /**
     * Create backup file and offer as download.
     */
    function createBackupFile() {
      var archive = archiver.create('zip', {});

      var path = os.tmpdir();
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
          .directory(storageService.getUserDataDirectory(), false, { date: new Date() })
          .finalize();
      }
    }

    /**
     * Restore application data from backup file.
     */
    function restoreBackup($event) {

      if(vm.backupFile) {
        vm.error = "";

        var confirm = $mdDialog.confirm()
          .parent(angular.element(document.body))
          .title('Sicher?')
          .content('Willst du die Sicherung wirklich wiederherstellen? Alle aktuell vorhandenen Daten werden überschrieben.')
          .targetEvent($event)
          .ok('Ja')
          .cancel('Oh. Nein!');

        $mdDialog.show(confirm).then(function() {
          confirm = null;

          var path = os.tmpdir();
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
        vm.error = "Es muss zuerst eine Sicherungsdatei ausgewählt werden.";
      }
    }

    function loadBackup(path) {

      var filePath = Path.join(path, 'backup.zip');

      fs.writeFile(filePath, new Buffer(vm.backupFile, 'binary'), function (err) {
        if (err) throw err;

        restoreBackupFile(filePath);
      });
    }

    /**
     *
     */
    function restoreBackupFile(filePath) {

      if(vm.backupFile == null) {
        vm.error = "Die Sicherungsdatei konnte nicht gelesen werden.";
        return;
      }

      var output = storageService.getUserDataDirectory();

      yauzl.open(filePath, function(err, zipfile) {
        if (err) throw err;
        zipfile.on("entry", function(entry) {
          if (/\/$/.test(entry.fileName)) {
            // directory file names end with '/'
            return;
          }

          zipfile.openReadStream(entry, function(err, readStream) {
            if (err) throw err;

            // ensure parent directory exists, and then:
            readStream.pipe(fs.createWriteStream(Path.join(output, entry.fileName)));
          });
        })
        .on('close', function() {
          $rootScope.$broadcast('backupRestored');

          $mdDialog.show(
              $mdDialog
                  .alert()
                  .clickOutsideToClose(true)
                  .title('Super!')
                  .content('Die Wiederherstellung war erfolgreich!')
                  .ok('Ok')
          ).then(function() {
            $state.go("patient.list", {});
          });
        })
        .on('error', function(err) {
          console.error(err);
          vm.error = "Die Wiederherstellung war leider nicht erfolgreich.";
        });
      });
    }
  }
})(window.moment);