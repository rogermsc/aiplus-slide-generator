import puppeteer from 'puppeteer';

const FONT_SETTLE_MS = parseInt(process.env.FONT_SETTLE_MS ?? '600', 10);

/**
 * Screenshot slides and return base64 PNG data.
 * @param {number} slideCount
 * @param {string} previewUrl
 * @returns {Promise<{index: number, base64: string}[]>}
 */
export async function screenshotToBase64(slideCount, previewUrl) {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--font-render-hinting=none'],
  });

  const results = [];

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 810, deviceScaleFactor: 2 });

    for (let i = 1; i <= slideCount; i++) {
      const nnn = String(i).padStart(3, '0');
      await page.goto(`${previewUrl}/slide/${nnn}`, { waitUntil: 'networkidle0', timeout: 15000 });
      await page.waitForFunction(() => document.fonts.status === 'loaded', { timeout: 5000 }).catch(() => {});
      await new Promise(r => setTimeout(r, FONT_SETTLE_MS));

      const buffer = await page.screenshot({
        type: 'png',
        fullPage: false,
        clip: { x: 0, y: 0, width: 1440, height: 810 },
      });

      results.push({ index: i, base64: buffer.toString('base64') });
    }
  } finally {
    await browser.close();
  }

  return results;
}
