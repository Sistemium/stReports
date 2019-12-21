'use strict';

import path from 'path';
import fs from 'fs';
import puppeteer from 'puppeteer';
import uuid from 'node-uuid';
import conf from '../config/environment';

const debug = require('debug')('stm:reports:createFile');

const domain = conf.api.printable;
const dirName = path.join(__dirname, 'files');

function getFileSizeInBytes(filename) {
  let stats = fs.statSync(filename);
  return stats.size;
}

export default async function (urlPath, format = 'pdf') {

  const url = domain + urlPath;
  const filename = `${uuid.v4()}.${format}`;
  const pathToFile = path.join(dirName, '/', filename);

  // const timeoutMs = 30000;

  const start = new Date();

  debug('childProcess start:', format, url);

  const browser = await puppeteer.launch({
    args: ['--no-sandbox'],
  });
  const page = await browser.newPage();

  let fileSize;

  try {

    if (format === 'png') {
      await page.setViewport({
        // TODO:
        width: 870,
        height: 600,
        deviceScaleFactor: 2,
      });
      await page.goto(url, { waitUntil: 'networkidle0' });
      await page.screenshot({
        path: pathToFile,
        omitBackground: true,
      });
    }

    if (format === 'pdf') {
      await page.setViewport({
        width: 932,
        height: 1315,
        deviceScaleFactor: 2,
      });
      await page.goto(url, { waitUntil: 'networkidle0' });
      await page.pdf({
        path: pathToFile,
        width: 1012,
        height: 1395,
        margin: { top: 40, bottom: 40, left: 40, right: 40 },
      });
    }

    fileSize = getFileSizeInBytes(pathToFile);

  } catch (e) {
    debug('error:', e);
  }

  await browser.close();

  if (!fileSize) {
    throw new Error('File not created');
  }

  return {
    url,
    filename,
    pathToFile,
    fileSize,
    processingTime: new Date() - start,
    contentType: contentType(format)
  };

}

function contentType(format) {
  return {
    pdf: 'application/pdf',
    png: 'image/png'
  }[format]
}
