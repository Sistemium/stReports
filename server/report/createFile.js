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

export default function (urlPath, extension) {

  const url = domain + urlPath;
  // generate filename from guid and extension, if extension not passed default is .pdf
  const filename = uuid.v4() + (extension || '.pdf');
  const pathToFile = path.join(dirName, '/', filename);
  const childArgs = [
    path.join(__dirname, 'load-ajax.js'),
    `${url} ${pathToFile}`
  ];

  return new Promise(function (resolve, reject) {

    let start = new Date();

    childProcess.exec(`${binPath} ${childArgs[0]} ${childArgs[1]}`, (err, stdout, stderr) => {

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
        pathToFile: pathToFile
      };

      debug('childProcess finished:', result);

      resolve(result);

    });

  });

}
