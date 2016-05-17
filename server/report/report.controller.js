'use strict';

import stapi from '../STAPI/model';
import createFile from './createFile';
import uploadFileToS3 from './uploadToS3'
import path from 'path';

const log = stapi('prt/log');

export function index(req, res) {

  createFile(req.query.path)
    .then((response) => {
      return uploadFileToS3(response);
    }, (err) => {
      console.log(err);
      res.sendStatus(500);
    })
    .then((fileUrl) => {
      res.redirect(fileUrl);
    })
    .catch((err) => {
      console.log(err);
      res.sendStatus(500);
    })
  ;
}

