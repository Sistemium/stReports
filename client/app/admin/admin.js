(function (ng) {
  'use strict';
  angular.module('streportsApp')
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
