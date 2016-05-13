(function (ng) {
  'use strict';
  ng.module('streportsApp')
    .factory('Log', function LogModel(DS) {
      return DS.defineResource({
        name: 'log'
      })
    })
  ;

})(angular);
