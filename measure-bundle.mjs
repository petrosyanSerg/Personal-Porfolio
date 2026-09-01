import { gzipSync } from 'node:zlib';

import { chromium } from '@playwright/test';

const browser = await chromium.launch({
  executablePath:
    process.env.PLAYWRIGHT_CHROMIUM_PATH ??
    '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'],
});

const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

const withScene = process.argv.includes('--with-3d');

if (!withScene) {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function patched(type, ...rest) {
      if (type === 'webgl2' || type === 'webgl') return null;
      return original.call(this, type, ...rest);
    };
  });
}

const seen = new Set();
let bytes = 0;

page.on('response', async (response) => {
  const url = response.url();
  if (!url.endsWith('.js') || seen.has(url)) return;
  seen.add(url);
  try {
    bytes += gzipSync(await response.body()).length;
  } catch {
    // A response that finished before its body could be read is not worth failing over.
  }
});

await page.goto('http://localhost:3399/en', { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);

console.log(
  `${withScene ? 'initial + 3D' : 'initial'} JS transferred (gzip): ` +
    `${(bytes / 1024).toFixed(1)} KB across ${seen.size} files`,
);

await browser.close();
