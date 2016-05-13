(function (ng) {
  'use strict';
  ng.module('streportsApp')
    .config(function ($stateProvider) {
      $stateProvider
        .state('admin', {
          url: '/admin',
          abstract: true,
          templateUrl: 'app/admin/admin.html'
        });
    })
  ;

})(angular);
