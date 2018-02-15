'use strict';

import {baseStapiModel} from 'sistemium-node';
import createFile from './createFile';
import uploadFileToS3 from './uploadToS3'

const log = baseStapiModel('prt/log');

export function index(req, res) {

  createFile(req.query.path, req.query.format)
    .then(response => uploadFileToS3(response, req.query.filename, req.query.title))
    .then((fileUrl) => {
      if (req.query.json) {
        return res.json({
          src: fileUrl
        });
      }
      return res.redirect(fileUrl);
    })
    .catch((err) => {
      console.error(err);
      return res.sendStatus(500);
    });

}

