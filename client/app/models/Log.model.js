(function (ng) {
  'use strict';
  ng.module('streportsApp')
    .run(function LogModel(Schema) {
      Schema.register({
        name: 'Log'
      });
    })
  ;

})(angular);
