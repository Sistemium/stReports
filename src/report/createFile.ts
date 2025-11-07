import puppeteer, { Page } from 'puppeteer';
import { randomUUID } from 'crypto';
import { createDebug } from '../utils/debug.js';
import config from '../config/environment.js';

const debug = createDebug('createFile');

export interface RenderOptions {
  width?: number;
  height?: number;
  media?: string;
  background?: boolean;
  scale?: number;
}

export interface RenderResult {
  url: string;
  filename?: string;
  processingTime: number;
  contentType: string;
  buffer: Buffer;
}

type Format = 'pdf' | 'png';

export async function renderReport(
  url: string,
  format: Format,
  filename?: string,
  options: RenderOptions = {}
): Promise<RenderResult> {
  const start = Date.now();

  // Generate filename if not provided
  const finalFilename = filename || `${randomUUID()}.${format}`;

  debug('renderReport:', format, url);

  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    headless: true,
  });

  let buffer: Buffer | undefined;

  try {
    const page = await browser.newPage();

    if (format === 'png') {
      buffer = await renderPng(page, url, options);
    } else if (format === 'pdf') {
      buffer = await renderPdf(page, url);
    } else {
      throw new Error(`Unsupported format: ${format}`);
    }
  } catch (error) {
    debug('error:', error);
    throw error;
  } finally {
    await browser.close();
  }

  if (!buffer) {
    throw new Error('File not created');
  }

  return {
    url,
    filename: finalFilename,
    processingTime: Date.now() - start,
    contentType: getContentType(format),
    buffer,
  };
}

async function pageGo(page: Page, url: string): Promise<void> {
  page.setDefaultNavigationTimeout(config.timeout);
  await page.goto(url, { waitUntil: 'networkidle0' });
}

async function renderPdf(page: Page, url: string): Promise<Buffer> {
  await pageGo(page, url);

  const buffer = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: { top: '1cm', bottom: '1cm', left: '1cm', right: '1cm' },
  });

  return Buffer.from(buffer);
}

async function renderPng(page: Page, url: string, options: RenderOptions): Promise<Buffer> {
  const {
    width = 870,
    height = 600,
    media,
    background = false,
    scale = 2,
  } = options;

  if (media) {
    await page.emulateMediaType(media);
  }

  await page.setViewport({
    width,
    height,
    deviceScaleFactor: scale,
  });

  await pageGo(page, url);

  const buffer = await page.screenshot({
    omitBackground: !background,
  });

  return Buffer.from(buffer);
}

function getContentType(format: Format): string {
  const contentTypes: Record<Format, string> = {
    pdf: 'application/pdf',
    png: 'image/png',
  };
  return contentTypes[format];
}
