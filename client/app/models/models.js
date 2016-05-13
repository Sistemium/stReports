(function (ng) {
  'use strict';

  ng.module('streportsApp')
    .config(function (DSHttpAdapterProvider) {
      angular.extend(DSHttpAdapterProvider.defaults, {
        basePath: 'api/'
      });
    })
    .service('models', function (Schema) {
      return Schema.models();
    })
    .run(function (DS, $rootScope) {
      $rootScope.$on('logged-off', function () {
        DS.clear();
      });
    });

})(angular);
