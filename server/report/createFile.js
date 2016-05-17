'use strict';

import path from 'path';
import childProcess from 'child_process';
import fs from 'fs';
import phantomjs from 'phantomjs-prebuilt';
import uuid from 'node-uuid';
import conf from '../config/environment';

const domain = conf.api.printable;
const binPath = phantomjs.path;
const dirName = path.join(__dirname, 'files');

function getFilesizeInBytes(filename) {
  var stats = fs.statSync(filename);
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

    var start = new Date();
    childProcess.exec(`${binPath} ${childArgs[0]} ${childArgs[1]}`, (err, stdout, stderr) => {
      if (err) {
        console.log(err);
        console.log('err in childProcess');
        return reject(err);
      }
      if (stderr) {
        console.log(stderr);
        console.log('stderr in childProcess');
        return reject(stderr);
      }

      console.log(stdout);
      resolve({
        filename: filename,
        url: url,
        processingTime: new Date() - start,
        filesize: getFilesizeInBytes(filename),
        pathToFile: pathToFile
      });
    });
  });
}
