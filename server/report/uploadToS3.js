'use strict';

import AWS from 'aws-sdk';
import conf from '../config/environment';
import fs from 'fs';

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
    Bucket: conf.S3.bucket,
    Key: options.filename,
    Body: fileStream
  };

  return new Promise(function (resolve, reject) {
    S3.putObject(params, (err) => {
      if (err) {
        console.log('Error occurred while uploading to S3:', err);
        return reject(err);
      }

      resolve(options.filename);
    })
  });
}
