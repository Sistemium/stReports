'use strict';

import path from 'path';
import childProcess from 'child_process';
import fs from 'fs';
import phantomjs from 'phantomjs-prebuilt';
import uuid from 'node-uuid';
import conf from '../config/environment';

const debug = require('debug')('stm:reports:createFile');

const domain = conf.api.printable;
const binPath = phantomjs.path;
const dirName = path.join(__dirname, 'files');

function getFilesizeInBytes(filename) {
  let stats = fs.statSync(filename);
  return stats.size;
}

export default function (urlPath, format) {

  format = format || 'pdf';

  const url = domain + urlPath;
  // generate filename from guid and extension, if extension not passed default is .pdf

  const filename = `${uuid.v4()}.${format}`;
  const pathToFile = path.join(dirName, '/', filename);

  const childPath = path.join(__dirname, 'load-ajax.js');
  const childArgs = `${url} ${pathToFile} ${format}`;

  return new Promise((resolve, reject) => {

    let start = new Date();

    childProcess.exec(`${binPath} ${childPath} ${childArgs}`, (err, stdout, stderr) => {

      if (err) {
        debug('error:', err);
        return reject(err);
      }

      if (stderr) {
        debug(stderr);
        return reject(stderr);
      }

      let result = {
        filename: filename,
        url: url,
        processingTime: new Date() - start,
        fileSize: getFilesizeInBytes(pathToFile),
        pathToFile: pathToFile,
        contentType: contentType(format)
      };

      debug('childProcess finished:', result);

      resolve(result);

    });

  });

}

function contentType(format) {
  return {
    pdf: 'application/pdf',
    png: 'image/png'
  }[format]
}
