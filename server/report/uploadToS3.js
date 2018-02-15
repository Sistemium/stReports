'use strict';

import AWS from 'aws-sdk';
import conf from '../config/environment';
import fs from 'fs';
import {baseStapiModel} from 'sistemium-node';

const log = baseStapiModel('prt/log');

const S3 = new AWS.S3(conf.awsCredentials);

const debug = require('debug')('stm:reports:uploadToS3');

function deleteFile(file) {
  fs.unlink(file, function (err) {
    if (err) {
      return console.error('Could not delete file', err);
    }
    debug('deleteFile success', file);
  });
}

export default function (options, filename, title) {

  let fileStream = fs.createReadStream(options.pathToFile);

  let params = {
    Bucket: conf.api.S3.bucket,
    Key: `${conf.api.S3.folder}/${filename || options.filename}`,
    Body: fileStream,
    ContentType: options.contentType || 'application/pdf'
  };

  return new Promise((resolve, reject) => {

    if (title) {
      params.ContentDisposition = `attachment; filename=${title};`
    }

    S3.putObject(params, err => {

      if (err) {
        console.error('Error occurred while uploading to S3:', err);
        return reject(err);
      }

      const fileUrl = `${conf.api.S3.awsUrl}/${conf.api.S3.bucket}/${params.Key}`;

      try {
        log({}).save({
          filename: options.filename,
          url: options.url,
          processingTime: options.processingTime,
          fileSize: options.fileSize,
          isConnectionAborted: false,
          fileUrl: fileUrl
        })
          .then(() => {
            debug('Log saved');
            deleteFile(options.pathToFile);
            resolve(fileUrl);
          })
          .catch(reject);
      } catch (e) {
        reject(e);
      }

    });

  });

}
