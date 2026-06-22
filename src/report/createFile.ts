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

  // Lay the page out at the exact printable width before navigation so the
  // measured layout matches what page.pdf renders line-for-line. The PDF uses
  // px margins (not '1cm') so its printable width equals this viewport exactly.
  await page.setViewport({ width: contentWidth, height: 600, deviceScaleFactor: 1 });

  await pageGo(page, url);

  // page.pdf renders in print media, so measure in print media too, and wait for
  // web fonts so text metrics are final before measuring.
  await page.emulateMediaType('print');
  await page.evaluate(() => (document.fonts ? document.fonts.ready.then(() => undefined) : undefined));

  // Measure the true content bottom. scrollHeight alone is unreliable because
  // Chromium drops the last element's bottom margin (it collapses out as the
  // body's external margin). A zero-height probe appended after the content sits
  // below that trailing margin, so its position is the real content height; take
  // the max with scrollHeight to also cover absolutely-positioned overflow.
  let contentHeight = await page.evaluate(() => {
    document.body.style.margin = '0';
    const probe = document.createElement('div');
    probe.style.cssText = 'height:0;clear:both';
    document.body.appendChild(probe);
    const probeBottom = probe.getBoundingClientRect().top + window.scrollY;
    probe.remove();
    return Math.ceil(
      Math.max(
        probeBottom,
        document.body.scrollHeight,
        document.documentElement.scrollHeight
      )
    );
  });

  // page.pdf's print rasterizer rounds each line box up, so a text-heavy page
  // can render slightly taller than the measured DOM and spill its tail onto a
  // second page. Grow the page height and re-render (cheap — no reload) until it
  // fits on a single page.
  let buffer = await pdfWithHeight(page, contentHeight);
  for (let attempt = 0; attempt < 5 && countPdfPages(buffer) > 1; attempt++) {
    contentHeight += 40;
    buffer = await pdfWithHeight(page, contentHeight);
  }

  return buffer;
}

// Renders the current page as a single PDF page A4 wide and `contentHeight` tall
// (plus 1cm margins on every side).
async function pdfWithHeight(page: Page, contentHeight: number): Promise<Buffer> {
  const buffer = await page.pdf({
    printBackground: true,
    width: `${A4_WIDTH_PX}px`,
    height: `${contentHeight + PDF_MARGIN_PX * 2}px`,
    margin: {
      top: `${PDF_MARGIN_PX}px`,
      bottom: `${PDF_MARGIN_PX}px`,
      left: `${PDF_MARGIN_PX}px`,
      right: `${PDF_MARGIN_PX}px`,
    },
  });
  return Buffer.from(buffer);
}

// Counts page objects in a Chromium-generated PDF. The page tree root is
// "/Type /Pages"; each rendered page is "/Type /Page".
function countPdfPages(pdf: Buffer): number {
  const matches = pdf.toString('latin1').match(/\/Type\s*\/Page(?!s)/g);
  return matches ? matches.length : 1;
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
