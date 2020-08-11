'use strict';

import { baseStapiModel } from 'sistemium-node';

const log = baseStapiModel('prt/log');

export function index(req, res) {

  log(req).find()
    .then(response => res.json(response))
    .catch((err) => {
      console.error(err);
      return res.statusCode(500);
    });

}
