(function (angular) {

  'use strict';

  angular
    .module('app.invoice')
    .controller('InvoiceTemplateController', InvoiceTemplateController);

  /* @ngInject */
  function InvoiceTemplateController($mdDialog, items) {
    const vm = this;

    vm.templates = items;

    vm.abort = function() {
      $mdDialog.cancel();
    };

    vm.chooseTemplate = function(template) {
      $mdDialog.hide(template.file);
    };
  }
})(window.angular);
