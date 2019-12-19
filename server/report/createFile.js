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

  let start = new Date();

  debug('childProcess start:', format, url);

  const browser = await puppeteer.launch();
  const page = await browser.newPage();

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

  await browser.close();

  return {
    url,
    filename,
    pathToFile,
    processingTime: new Date() - start,
    fileSize: getFileSizeInBytes(pathToFile),
    contentType: contentType(format)
  };

}

function contentType(format) {
  return {
    pdf: 'application/pdf',
    png: 'image/png'
  }[format]
}
