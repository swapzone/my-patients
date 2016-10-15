(function () {

  'use strict';

  angular
    .module('app.patient')
    .controller('PatientController', PatientController);

  /* @ngInject */
  function PatientController($scope, $state, $location, $anchorScroll, patientService, users) {
    const vm = this;

    vm.activeAnchors = [];
    vm.anchors = [
      'A', 'D', 'G', 'J', 'M', 'P', 'S', 'V', 'Y'
    ];

    vm.users = users;
    vm.showFilter = false;
    vm.filter = null;

    $scope.$watch('vm.showFilter', function() {
      // the variable must be watched since it can be set from the
      // watchMe directive
      if(vm.showFilter == false)
        vm.filter = null;
    });

    vm.$onInit = () => {
      vm.patients = patientService.patients;
      vm.patients.sort(function(a, b) {
        if(a['lastname'] > b['lastname']) {
          return 1;
        }
        if(a['lastname'] < b['lastname']) {
          return -1;
        }
        return 0;
      });
    };

    /**
     * Select one patient and show details.
     *
     * @param index
     */
    let selectPatient = (index) => {
      $state.go("patient.details", { active: angular.toJson(vm.patients[index]) });
    };

    /**
     *
     */
    let toggleFilter = () => {
      vm.showFilter = !vm.showFilter;

      if(!vm.showFilter) {
        vm.filter = null;
      }
    };

    /**
     * Filter the patient list.
     *
     * @param patient
     * @returns {boolean}
     */
    let filterPatient = (patient) => {
      if(!vm.filter) {
        return true;
      }

      var firstname = patient.lastname.toLowerCase();
      var lastname = patient.firstname.toLowerCase();
      var filter = vm.filter.toLowerCase();

      return firstname.indexOf(filter) > -1 || lastname.indexOf(filter) > -1;
    };

    /**
     * Calculate the fast link anchors.
     *
     * @param patient
     * @returns {boolean}
     */
    let setAnchor = (patient) => {
      var newLetter = patient.lastname.substring(0, 1).toUpperCase();

      if(!vm.lastLetter) {
        vm.lastLetter = newLetter;

        if(vm.anchors.indexOf(newLetter) > -1) {
          if(vm.activeAnchors.indexOf(newLetter) === -1) {
            vm.activeAnchors.push(newLetter);
          }
          return true;
        }
      }
      else {
        if(vm.lastLetter != newLetter && vm.anchors.indexOf(newLetter) > -1) {
          if(vm.activeAnchors.indexOf(newLetter) === -1) {
            vm.activeAnchors.push(newLetter);
          }
          return true;
        }
      }
      return false;
    };

    /**
     * Scroll to the given anchor by giving the id of the element to scroll to.
     *
     * @param anchor
     */
    let scrollTo = (anchor) => {
      $location.hash('index-' + anchor.toLowerCase());
      $anchorScroll();
    };

    //
    // Controller API
    //
    vm.selectPatient = selectPatient;
    vm.filterPatient = filterPatient;
    vm.setAnchor = setAnchor;
    vm.scrollTo = scrollTo;
    vm.toggleFilter = toggleFilter;
  }
})();