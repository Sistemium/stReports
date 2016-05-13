(function (ng) {
  'use strict';
  ng.module('streportsApp')
    .config(function ($stateProvider) {
      $stateProvider
        .state('admin.log', {
          url: '/log',
          templateUrl: 'app/admin/log/log.html',
          controller: 'LogController',
          controllerAs: 'vm'
        });
    })
  ;

})(angular);
