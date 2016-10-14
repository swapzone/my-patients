(function () {

  'use strict';

  angular
    .module('app.patient')
    .controller('PatientController', PatientController);

  /* @ngInject */
  function PatientController($scope, $state, $location, $anchorScroll, patientService, users) {
    let vm = this;

    $scope.activeAnchors = [];

    $scope.anchors = [
      'A', 'D', 'G', 'J', 'M', 'P', 'S', 'V', 'Y'
    ];

    vm.users = users;
    vm.showFilter = false;
    vm.filter = null;

    vm.toggleFilter = function() {
      vm.showFilter = !vm.showFilter;

      if(!vm.showFilter) {
        vm.filter = null;
      }
    };

    $scope.$watch('vm.showFilter', function() {
      // the variable must be watched since it can be set from the
      // watchMe directive
      if(vm.showFilter == false)
        vm.filter = null;
    });

    vm.selectPatient = selectPatient;
    vm.filterPatient = filterPatient;
    vm.setAnchor = setAnchor;
    vm.scrollTo = scrollTo;

    vm.$onInit = () => {
      vm.patients = patientService.patients;
      vm.patients.sort(function(a, b) {
        if(a['lastname'] > b['lastname'])
          return 1;
        if(a['lastname'] < b['lastname'])
          return -1;

        return 0;
      });
    };

    /**
     * Select one patient and show details.
     *
     * @param index
     */
    function selectPatient(index) {
      $state.go("patient.details", { active: angular.toJson(vm.patients[index]) });
    }

    /**
     * Filter the patient list.
     *
     * @param patient
     * @returns {boolean}
     */
    function filterPatient(patient) {

      if(!vm.filter)
        return true;

      var firstname = patient.lastname.toLowerCase();
      var lastname = patient.firstname.toLowerCase();
      var filter = vm.filter.toLowerCase();

      return firstname.indexOf(filter) > -1 || lastname.indexOf(filter) > -1;
    }

    /**
     * Calculate the fast link anchors.
     *
     * @param patient
     * @returns {boolean}
     */
    function setAnchor(patient) {
      var newLetter = patient.lastname.substring(0, 1).toUpperCase();

      if(!_this.lastLetter) {
        _this.lastLetter = newLetter;

        if(vm.anchors.indexOf(newLetter) > -1) {
          if(vm.activeAnchors.indexOf(newLetter) === -1)
            vm.activeAnchors.push(newLetter);

          return true;
        }
      }
      else {
        if(_this.lastLetter != newLetter && vm.anchors.indexOf(newLetter) > -1) {
          if(vm.activeAnchors.indexOf(newLetter) === -1)
            vm.activeAnchors.push(newLetter);

          return true;
        }
      }

      return false;
    }

    /**
     * Scroll to the given anchor.
     *
     * @param anchor
     */
    function scrollTo(anchor) {
      // set the location.hash to the id of
      // the element you wish to scroll to.
      $location.hash('index-' + anchor.toLowerCase());

      // call $anchorScroll()
      $anchorScroll();
    }
  }
})();