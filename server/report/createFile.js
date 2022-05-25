'use strict';

import path from 'path';
import fs from 'fs';
import puppeteer from 'puppeteer';
import * as uuid from 'uuid';
import conf from '../config/environment';

const debug = require('debug')('stm:reports:createFile');

export async function renderPdf(urlPath) {
  return renderReport(urlPath, 'pdf');
}

export default async function (url, format = 'pdf') {
  const filename = `${uuid.v4()}.${format}`;
  return renderReport(url, format, filename);
}

export async function renderReport(url, format, filename, etc = {}) {

  const start = new Date();

  debug('renderReport:', format, url);

  const browser = await puppeteer.launch({
    args: ['--no-sandbox'],
  });
  const page = await browser.newPage();

  let buffer;

  try {

    if (format === 'png') {
      buffer = await renderPng();
    }

    if (format === 'pdf') {
      buffer = await renderPdf();
    }

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
    processingTime: new Date() - start,
    contentType: contentType(format),
    buffer,
  };

  async function pageGo() {
    await page.setDefaultNavigationTimeout(conf.api.timeout);
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
      path: '',
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

    const { width = 870, height = 600, media, background = false, scale = 2 } = etc;

    if (media) {
      await page.emulateMediaType(media);
    }

    await page.setViewport({
      width,
      height,
      deviceScaleFactor: scale,
    });

    await pageGo();

    return page.screenshot({
      path: '',
      omitBackground: !background,
    });

  }

}

function contentType(format) {
  return {
    pdf: 'application/pdf',
    png: 'image/png'
  }[format]
}
