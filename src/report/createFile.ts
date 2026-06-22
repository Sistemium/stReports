import { Page } from 'puppeteer-core';
import { randomUUID } from 'crypto';
import { createDebug } from '../utils/debug.js';
import config from '../config/environment.js';
import { launchBrowser } from '../utils/launchBrowser.js';

const debug = createDebug('createFile');

export interface RenderOptions {
  width?: number;
  height?: number;
  media?: string;
  background?: boolean;
  scale?: number;
  singlePage?: boolean;
}

// A4 width and 1cm margin expressed in CSS pixels at 96 DPI.
// Used to render a single continuous PDF page without pagination.
const A4_WIDTH_PX = 794; // 210mm at 96 DPI
const PDF_MARGIN_PX = 38; // 1cm at 96 DPI

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

  const browser = await launchBrowser();

  let buffer: Buffer | undefined;

  try {
    const page = await browser.newPage();

    if (format === 'png') {
      buffer = await renderPng(page, url, options);
    } else if (format === 'pdf') {
      buffer = await renderPdf(page, url, options);
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

async function renderPdf(page: Page, url: string, options: RenderOptions = {}): Promise<Buffer> {
  if (options.singlePage) {
    return renderSinglePagePdf(page, url);
  }

  await pageGo(page, url);

  const buffer = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: { top: '1cm', bottom: '1cm', left: '1cm', right: '1cm' },
  });

  return Buffer.from(buffer);
}

// Renders the whole document as one continuous A4-wide page (no pagination).
// The content height is measured at the printable width and the PDF page height
// is set to fit it, plus top/bottom margins, so nothing spills onto a second page.
async function renderSinglePagePdf(page: Page, url: string): Promise<Buffer> {
  const contentWidth = A4_WIDTH_PX - PDF_MARGIN_PX * 2;

  // Lay the page out at the printable width before navigation so responsive
  // and lazy-loaded content renders exactly as it will be printed.
  await page.setViewport({ width: contentWidth, height: 600, deviceScaleFactor: 1 });

  await pageGo(page, url);

  // Measure in print media so the height matches what page.pdf actually renders.
  await page.emulateMediaType('print');
  const contentHeight = await page.evaluate(() => document.documentElement.scrollHeight);

  const buffer = await page.pdf({
    printBackground: true,
    width: `${A4_WIDTH_PX}px`,
    height: `${contentHeight + PDF_MARGIN_PX * 2}px`,
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
