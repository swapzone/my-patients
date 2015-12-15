(function () {
  'use strict';

  var fs = require('fs');

  angular
    .module('app', [
      'app.common',
      'app.core',
      'app.index',
      'app.patient',
      'app.invoice',
      'app.backup',
      'app.settings',
      'app.templates'
    ])
    .value('users', [])
    .constant('INSURANCE_TYPE', {
      'state': 'Gesetzlich',
      'private': 'Privat',
      'privatePlus': 'Privat Zusatz'
    })
    .config(routeConfig)
    .config(cleanFiles);

  function routeConfig($stateProvider, $urlRouterProvider) {

    $urlRouterProvider.when('/', '/patient/list');
    $urlRouterProvider.otherwise('/patient/list');

    $stateProvider.state('root', {
      abstract: true,
      template: '<div ui-view></div>'
    });
  }

  /**
   *
   */
  function cleanFiles() {
    // clean up old backup files
    var path = __dirname + '/temp';
    deleteFolderRecursive(path);
  }

  /**
   *
   *
   * @param path
   */
  function deleteFolderRecursive(path) {
    if( fs.existsSync(path) ) {
      fs.readdirSync(path).forEach(function(file,index){
        var curPath = path + "/" + file;
        if(fs.lstatSync(curPath).isDirectory()) { // recurse
          deleteFolderRecursive(curPath);
        } else { // delete file
          fs.unlinkSync(curPath);
        }
      });
      fs.rmdirSync(path);
    }
  }
})();