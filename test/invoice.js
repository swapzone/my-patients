describe('invoiceController', function() {
  beforeEach(module('app.invoice'));

  var $controller;

  beforeEach(inject(function(_$controller_){
    // The injector unwraps the underscores (_) from around the parameter names when matching
    $controller = _$controller_;
  }));

  describe('test function', function() {

    it('should do something crazy', function() {
      var $scope = {};
      var controller = $controller('invoiceCtrl', { $scope: $scope });

      // do something with scope like calling a function or setting variables


      expect($scope.myVariable).toEqual('cool');
    });
  });
});