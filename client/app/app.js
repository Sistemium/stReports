'use strict';

angular.module('streportsApp', [
  'streportsApp.constants',
  'ui.router',
  'sistemium',
  'sistemiumBootstrap'
])
  .config(function($urlRouterProvider) {
    $urlRouterProvider
      .otherwise('/');
  });
