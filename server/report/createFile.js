'use strict';

import path from 'path';
import fs from 'fs';
import puppeteer from 'puppeteer';
import * as uuid from 'uuid';
import conf from '../config/environment';

const debug = require('debug')('stm:reports:createFile');

const domain = conf.api.printable;
const dirName = path.join(__dirname, 'files');

function getFileSizeInBytes(filename) {
  let stats = fs.statSync(filename);
  return stats.size;
}

export async function renderPdf(urlPath) {
  return renderReport(urlPath, 'pdf');
}

export default async function (urlPath, format = 'pdf') {
  const filename = `${uuid.v4()}.${format}`;
  const url = domain + urlPath;
  return renderReport(url, format, filename);
}

async function renderReport(url, format, filename) {

  const pathToFile = filename && path.join(dirName, '/', filename);

  // const timeoutMs = 30000;

  const start = new Date();

  debug('renderReport:', format, url);

  const browser = await puppeteer.launch({
    args: ['--no-sandbox'],
  });
  const page = await browser.newPage();

  let fileSize;
  let buffer;

  try {

    if (format === 'png') {
      buffer = await renderPng();
    }

    if (format === 'pdf') {
      buffer = await renderPdf();
    }

    fileSize = pathToFile ? getFileSizeInBytes(pathToFile) : 0;

  } catch (e) {
    debug('error:', e);
  }

  await browser.close();

  if (!buffer) {
    throw new Error('File not created');
  }

  return {
    url,
    filename,
    pathToFile,
    fileSize,
    processingTime: new Date() - start,
    contentType: contentType(format),
    buffer,
  };

  async function pageGo() {
    await page.goto(url, { waitUntil: 'networkidle0' });
    // await page.waitForFunction(async () => {
    //   await new Promise(resolve => setTimeout(resolve, 1000));
    // });
  }

  async function renderPdf() {
    // await page.setViewport({
    //   width: 932,
    //   height: 1315,
    //   deviceScaleFactor: 2,
    // });
    await pageGo();
    const options = {
      format: 'a4',
      path: pathToFile || '',
      printBackground: true,
      // width: 932,
      // height: 1315,
      margin: { top: '1cm', bottom: '1cm', left: '1cm', right: '1cm' },
      // displayHeaderFooter: true,
      // headerTemplate: '<div></div>',
      // footerTemplate: '<div style="font-size: 8px; text-align: right">Страница
      // <span class="pageNumber"></span> / <span class="totalPages"></span></div>'
    };
    return page.pdf(options);
  }

  async function renderPng() {
    await page.setViewport({
      // TODO:
      width: 870,
      height: 600,
      deviceScaleFactor: 2,
    });
    await pageGo();
    return page.screenshot({
      path: pathToFile || '',
      omitBackground: true,
    });
  }

}

function contentType(format) {
  return {
    pdf: 'application/pdf',
    png: 'image/png'
  }[format]
}
