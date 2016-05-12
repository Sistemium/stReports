'use strict';

var stapi = require('../../STAPI/model');
var log = stapi('prt/log');

export function index(req, res) {
  log(req).find()
    .then((response) => {
      return res.json(response);
    })
    .catch((err) => {
      return res.statusCode(500);
    })
  ;
}
