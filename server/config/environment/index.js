'use strict';

import path from 'path';
import _ from 'lodash';

function requiredProcessEnv(name) {
  if (!process.env[name]) {
    throw new Error('You must set the ' + name + ' environment variable');
  }
  return process.env[name];
}

// All configurations will extend these options
// ============================================
export default {
  env: process.env.NODE_ENV,

  // Root path of server
  root: path.normalize(__dirname + '/../../..'),

  // Server port
  port: process.env.PORT || 8999,

  // Server IP
  ip: process.env.IP || '0.0.0.0',

  api: {
    S3: {
      bucket: requiredProcessEnv('S3_BUCKET'),
      domain: requiredProcessEnv('S3_DOMAIN'),
      awsUrl: requiredProcessEnv('S3_DOMAIN'),
      folder: requiredProcessEnv('S3_FOLDER'),
    },
    printable: requiredProcessEnv('PRINTABLE'),
    stapi: requiredProcessEnv('STAPI')
  },

  awsCredentials: {
    accessKeyId: requiredProcessEnv('AWS_ACCESS_KEY_ID'),
    secretAccessKey: requiredProcessEnv('AWS_SECRET_ACCESS_KEY')
  },

  phantom: {
    cachePath: process.env.PHANTOM_CACHE_PATH || false
  }
};
