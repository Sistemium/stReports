'use strict';

// import {baseStapiModel} from 'sistemium-node';
import createFile, { renderReport } from './createFile';
import uploadFileToS3 from './uploadToS3'
import contentDisposition from 'content-disposition';
import conf from '../config/environment';

// const log = baseStapiModel('prt/log');

export function index(req, res, next) {

  const { path, format, filename, title } = req.query;

  const domain = conf.api.printable;

  const { url = `${domain}${path}` } = req.query;

  createFile(url, format)
    .then(response => uploadFileToS3(response, filename, title))
    .then(fileUrl => {
      if (req.query.json) {
        return res.json({
          src: fileUrl
        });
      }
      return res.redirect(fileUrl);
    })
    .catch(next);

}

export function pdf(req, res, next) {

  const { url, name, width, height, media, background, scale = '2' } = req.query;
  const { format } = req.params;

  if (!/^(png|pdf)$/.test(format)) {
    res.status(400).send('Wrong format. Allowed types are pdf and png');
    return;
  }

  if (!url) {
    res.status(400).send('Empty url');
    return;
  }

  const options = {
    media,
    background: !!background,
    scale: parseInt(scale),
  };

  if (width && height) {
    Object.assign(options, { width: parseInt(width), height: parseInt(height) });
  }

  renderReport(url, format, name, options)
    .then(({ buffer, contentType }) => {

      res.contentType(contentType);

      if (name) {
        const nameExt = `${name.replace(/\//g, '-')}.${format}`;
        const fileName = contentDisposition(nameExt, { fallback: false });
        res.header('Content-Disposition', fileName);
      }

      res.send(buffer);

    })
    .catch(next);

}
