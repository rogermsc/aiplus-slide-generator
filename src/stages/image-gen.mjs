import { GoogleGenAI } from '@google/genai';
import fs              from 'node:fs/promises';
import path            from 'node:path';
import sharp           from 'sharp';
import { retry }       from '../utils/retry.mjs';

const GEMINI_CONCURRENCY = parseInt(process.env.GEMINI_CONCURRENCY ?? '5', 10);

let _genai = null;
function getGenAI() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('GEMINI_API_KEY is not set');
  if (!_genai) _genai = new GoogleGenAI({ apiKey: key });
  return _genai;
}

/**
 * Generate images for all photo-panel slides with a concurrency cap.
 * Mutates plan.rightPanel.imagePath on success.
 */
export async function generateImages(plans, outDir) {
  await fs.mkdir(outDir, { recursive: true });

  const photoSlides = plans.filter(p => p.rightPanel.type === 'photo' && p.imagePrompt);
  if (photoSlides.length === 0) return plans;

  console.log(`  [image-gen] ${photoSlides.length} images (concurrency: ${GEMINI_CONCURRENCY})`);

  for (let i = 0; i < photoSlides.length; i += GEMINI_CONCURRENCY) {
    const batch   = photoSlides.slice(i, i + GEMINI_CONCURRENCY);
    const results = await Promise.allSettled(batch.map(p => generateOne(p, outDir)));

    results.forEach((result, bi) => {
      const plan = batch[bi];
      if (result.status === 'fulfilled') {
        plan.rightPanel.imagePath = result.value;
        console.log(`    ✓ Slide ${plan.index} image saved`);
      } else {
        console.warn(`    ✗ Slide ${plan.index} failed (blob fallback): ${result.reason?.message}`);
        plan.rightPanel.type = 'blob';
      }
    });

    if (i + GEMINI_CONCURRENCY < photoSlides.length)
      await new Promise(r => setTimeout(r, 1200));
  }

  return plans;
}

async function generateOne(plan, outDir) {
  const prompt = buildPrompt(plan.imagePrompt);

  // Attempt 1: Gemini Flash with native image generation (free tier)
  try {
    const response = await retry(
      () => getGenAI().models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: prompt,
        config: { responseModalities: ['IMAGE', 'TEXT'] },
      }),
      { attempts: 2, delayMs: 3000, backoffMultiplier: 2 }
    );

    const imagePart = response.candidates?.[0]?.content?.parts
      ?.find(p => p.inlineData?.mimeType?.startsWith('image/'));

    if (imagePart?.inlineData?.data) {
      return await saveImage(imagePart.inlineData.data, plan.index, outDir);
    }
    console.warn(`    [image-gen] Flash returned no image for slide ${plan.index}, trying Imagen…`);
  } catch (err) {
    console.warn(`    [image-gen] Flash failed for slide ${plan.index}: ${err.message}`);
  }

  // Attempt 2: Imagen 3.0 (paid tier)
  const response = await retry(
    () => getGenAI().models.generateImages({
      model:  'imagen-3.0-generate-002',
      prompt,
      config: { numberOfImages: 1, outputMimeType: 'image/png', aspectRatio: '16:9' },
    }),
    { attempts: 2, delayMs: 4000, backoffMultiplier: 2 }
  );

  const imgData = response.generatedImages?.[0]?.image?.imageBytes;
  if (!imgData) throw new Error('No image bytes returned');
  return await saveImage(imgData, plan.index, outDir);
}

async function saveImage(base64Data, slideIndex, outDir) {
  const filename = `img_slide${String(slideIndex).padStart(3, '0')}.png`;
  const filepath = path.join(outDir, filename);
  await fs.writeFile(filepath, Buffer.from(base64Data, 'base64'));
  return filepath;
}

function buildPrompt(raw) {
  return [
    raw,
    'Professional photography, soft natural lighting.',
    'Color palette: cool lavender and deep purple tones.',
    'Semi-desaturated, high-end corporate training aesthetic.',
    'No text, logos, or overlaid graphics in the image.',
    'Photorealistic, 16:9 composition, right-half crop focus.',
  ].join(' ');
}

/**
 * Crop generated image to the right-panel dimensions (40% of 1440×810).
 */
export async function cropRightPanel(imagePath) {
  const SLIDE_W = 1440, SLIDE_H = 810;
  const PANEL_W = Math.round(SLIDE_W * 0.40);

  const outPath = imagePath.replace('.png', '_panel.webp');
  await sharp(imagePath)
    .resize(SLIDE_W, SLIDE_H, { fit: 'cover', position: 'right' })
    .extract({ left: SLIDE_W - PANEL_W, top: 0, width: PANEL_W, height: SLIDE_H })
    .webp({ quality: 92 })
    .toFile(outPath);

  return outPath;
}
