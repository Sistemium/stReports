'use strict';

// import {baseStapiModel} from 'sistemium-node';
import createFile, { renderPdf } from './createFile';
import uploadFileToS3 from './uploadToS3'

// const log = baseStapiModel('prt/log');

export function index(req, res) {

  createFile(req.query.path, req.query.format)
    .then(response => uploadFileToS3(response, req.query.filename, req.query.title))
    .then(fileUrl => {
      if (req.query.json) {
        return res.json({
          src: fileUrl
        });
      }
      return res.redirect(fileUrl);
    })
    .catch(err => {
      console.error(err);
      res.sendStatus(500);
    });

}

export function pdf(req, res, next) {

  const { url } = req.query;

  if (!url) {
    res.status(400).send('Empty url');
    return;
  }

  renderPdf(url)
    .then(({ buffer }) => {
      res.contentType('application/pdf');
      res.send(buffer);
    })
    .catch(next);

}
