import type { Browser, LaunchOptions } from 'puppeteer';

const COMMON_ARGS = [
  '--no-sandbox',
  '--disable-setuid-sandbox',
  '--disable-dev-shm-usage',
  '--no-zygote',
  '--disable-gpu',
];

export async function launchBrowser(
  extraArgs: string[] = [],
  override?: Partial<LaunchOptions>
): Promise<Browser> {
  const args = [...COMMON_ARGS, ...extraArgs];

  if (process.env.PUPPETEER_EXECUTABLE_PATH) {
    const puppeteerCore = (await import('puppeteer-core')).default;
    return puppeteerCore.launch({
      headless: true,
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
      args,
      ...override,
    });
  }

  const puppeteer = (await import('puppeteer')).default;
  return puppeteer.launch({
    headless: true,
    args,
    ...override,
  });
}
