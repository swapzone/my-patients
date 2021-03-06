(function () {

  'use strict';

  var Path = require('path');
  var packageInformation = require('./package.json');

  angular
    .module('app.common')
    .service('storageService', storageService);

  /* @ngInject */
  function storageService() {
    let service = this;

    /**
     * Returns the path where user data will be stored.
     *
     * @returns {*}
     */
    service.getUserDataDirectory = (file) => {
      if (!file) {
        file = "";
      }

      if (process.env.APPDATA) {
        return Path.join(process.env.LOCALAPPDATA, packageInformation.name, 'data', file);
      }
      else {
        return process.platform == 'darwin' ?
          Path.join(process.env.HOME, 'Library/Preference', packageInformation.name, 'data', file) :
          Path.join('/var/local', packageInformation.name, 'data', file);
      }
    };
  }
})();