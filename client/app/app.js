'use strict';

angular.module('streportsApp', [
  'streportsApp.constants',
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ui.router'
])
  .config(function($urlRouterProvider) {
    $urlRouterProvider
      .otherwise('/');
  });
