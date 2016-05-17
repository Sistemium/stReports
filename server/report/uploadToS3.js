'use strict';

import AWS from 'aws-sdk';
import conf from '../config/environment';
import fs from 'fs';
import stapi from '../STAPI/model';

const log = stapi('prt/log');

const S3 = new AWS.S3(conf.awsCredentials);

function deleteFile(file) {
  fs.unlink(file, function (err) {
    if (err) console.log('Could not delete file', err);
    else console.log(file, 'successfully deleted!');
  });
}

export default function (options) {
  let fileStream = fs.createReadStream(options.pathToFile);

  const params = {
    Bucket: conf.api.S3.bucket,
    Key: options.filename,
    Body: fileStream,
    ContentType: options.contentType || 'application/pdf'
  };

  return new Promise(function (resolve, reject) {
    S3.putObject(params, (err) => {
      if (err) {
        console.log('Error occurred while uploading to S3:', err);
        return reject(err);
      }
      const fileUrl = conf.api.S3.awsUrl + '/' + conf.api.S3.bucket + '/' + options.filename;

      log().save({
        filename: options.filename,
        url: options.url,
        processingTime: options.processingTime,
        fileSize: options.fileSize,
        isConnectionAborted: false,
        fileUrl: fileUrl
      }).then(() => {
        console.log('Log saved');
        deleteFile(options.pathToFile);
        resolve(fileUrl);
      });
    })
  });
}
