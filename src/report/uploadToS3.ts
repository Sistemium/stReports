import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import contentDisposition from 'content-disposition';
import config from '../config/environment.js';
import { createDebug } from '../utils/debug.js';
import type { RenderResult } from './createFile.js';

const debug = createDebug('uploadToS3');

// AWS SDK v3 automatically uses credentials from environment or instance role
const s3Client = new S3Client({});

export interface UploadOptions {
  filename?: string;
  title?: string;
}

export async function uploadToS3(
  renderResult: RenderResult,
  options: UploadOptions = {}
): Promise<string> {
  const { filename, title } = options;
  const key = `${config.s3.folder}/${filename || renderResult.filename}`;

  const params: any = {
    Bucket: config.s3.bucket,
    Key: key,
    Body: renderResult.buffer,
    ContentType: renderResult.contentType,
  };

  if (title) {
    params.ContentDisposition = contentDisposition(title, { fallback: false });
  }

  try {
    const command = new PutObjectCommand(params);
    await s3Client.send(command);

    const fileUrl = `${config.s3.domain}/${config.s3.bucket}/${key}`;
    debug('saved', fileUrl);
    return fileUrl;
  } catch (error) {
    console.error('Error occurred while uploading to S3:', error);
    throw error;
  }
}
