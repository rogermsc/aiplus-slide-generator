import puppeteer   from 'puppeteer';
import PptxGenJS   from 'pptxgenjs';
import path        from 'node:path';
import fs          from 'node:fs/promises';

const SCREENSHOT_CONCURRENCY = parseInt(process.env.SCREENSHOT_CONCURRENCY ?? '5', 10);
const FONT_SETTLE_MS         = parseInt(process.env.FONT_SETTLE_MS ?? '600', 10);

export async function screenshotSlides(slideCount, outDir, previewUrl) {
  const base = previewUrl ?? process.env.SLIDE_PREVIEW_URL;
  if (!base) throw new Error('SLIDE_PREVIEW_URL not set');

  await assertPreviewServer(base);

  const screenshotsDir = path.join(outDir, 'screenshots');
  await fs.mkdir(screenshotsDir, { recursive: true });

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--font-render-hinting=none'],
  });

  const paths = new Array(slideCount).fill(null);
  const queue = Array.from({ length: slideCount }, (_, i) => i + 1);

  try {
    const pool = await Promise.all(
      Array.from({ length: Math.min(SCREENSHOT_CONCURRENCY, slideCount) }, () =>
        browser.newPage()
      )
    );

    await Promise.all(pool.map(p =>
      p.setViewport({ width: 1440, height: 810, deviceScaleFactor: 2 })
    ));

    async function worker(page) {
      while (queue.length > 0) {
        const num = queue.shift();
        const nnn = String(num).padStart(3, '0');
        const url = `${base}/slide/${nnn}`;

        await page.goto(url, { waitUntil: 'networkidle0', timeout: 20000 });
        await page.waitForFunction(() => document.fonts.status === 'loaded', { timeout: 5000 })
          .catch(() => {});
        await new Promise(r => setTimeout(r, FONT_SETTLE_MS));

        const outPath = path.join(screenshotsDir, `slide${nnn}.png`);
        await page.screenshot({
          path:     outPath,
          type:     'png',
          fullPage: false,
          clip:     { x: 0, y: 0, width: 1440, height: 810 },
        });

        paths[num - 1] = outPath;
        console.log(`    📸 ${num}/${slideCount}`);
      }
    }

    await Promise.all(pool.map(p => worker(p)));
  } finally {
    await browser.close();
  }

  const missing = paths.reduce((a, p, i) => p === null ? [...a, i + 1] : a, []);
  if (missing.length > 0)
    throw new Error(`Screenshots missing for slides: ${missing.join(', ')}`);

  return paths;
}

async function assertPreviewServer(url) {
  try {
    const res = await fetch(`${url}/health`, { signal: AbortSignal.timeout(4000) });
    if (!res.ok) throw new Error(`Status ${res.status}`);
  } catch (err) {
    throw new Error(
      `Preview server at ${url} is not responding.\nStart it: npm run preview\nError: ${err.message}`
    );
  }
}

export async function buildPptx(screenshotPaths, outputPath, moduleTitle) {
  const pptx    = new PptxGenJS();
  pptx.layout   = 'LAYOUT_WIDE';
  pptx.title    = moduleTitle;
  pptx.author   = 'AI+PRO Slide Generator';
  pptx.subject  = moduleTitle;

  for (const imgPath of screenshotPaths) {
    const slide = pptx.addSlide();
    slide.addImage({ path: imgPath, x: 0, y: 0, w: '100%', h: '100%' });
    slide.addNotes(`Source: ${path.basename(imgPath)}`);
  }

  await pptx.writeFile({ fileName: outputPath });
  console.log(`    ✓ PPTX: ${outputPath}`);
}
