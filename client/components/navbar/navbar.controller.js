'use strict';

class NavbarController {
  //start-non-standard
  menu = [{
    'title': 'Home',
    'state': 'main'
  }, {
    'title': 'Logs',
    'state': 'admin.log'
  }];

  isCollapsed = true;
  //end-non-standard

  constructor() {
  }
}

angular.module('streportsApp')
  .controller('NavbarController', NavbarController);
