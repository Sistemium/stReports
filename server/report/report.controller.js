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
      console.log('Error while creatingFile to S3', err);
      return res.sendStatus(500);
    })
    .then((fileUrl) => {
      return res.redirect(fileUrl);
    })
    .catch((err) => {
      console.log(err);
      return res.sendStatus(500);
    })
  ;
}

