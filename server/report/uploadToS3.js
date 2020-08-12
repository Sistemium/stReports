import AWS from 'aws-sdk';
import conf from '../config/environment';

const S3 = new AWS.S3(conf.awsCredentials);
const debug = require('debug')('stm:reports:uploadToS3');

export default function (options, filename, title) {

  const params = {
    Bucket: conf.api.S3.bucket,
    Key: `${conf.api.S3.folder}/${filename || options.filename}`,
    Body: options.buffer,
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
      debug('saved', fileUrl);
      resolve(fileUrl);

    });

  });

}
