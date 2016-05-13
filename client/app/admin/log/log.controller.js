(function (ng) {
  'use strict';

  function LogController($window, models, sabNgTable) {

    var Log = models.Log;
    var vm = this;
    vm.ngTable = {
      count: 12
    };

    sabNgTable.setup(vm, {

      getCount: function (params) {
        return Log.getCount([Log, params]);
      },

      findAll: function (params, o) {
        return Log.findAll(params, o);
      }
    });

    angular.extend(vm, {
      onClick: function (filename) {
        $window.open('/files/' + filename);
      }
    });

  }

  ng.module('streportsApp')
    .controller('LogController', LogController)
  ;

})(angular);
