#!/usr/bin/env node
// node generate-slides.mjs <module.md> [--session "SESSION 1"] [--module "MODULE 1"]
//                                      [--domain aiplus.domain] [--out ./out]
//                                      [--duration 150] [--skip-images]

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import path     from 'node:path';
import minimist from 'minimist';
import { parseModule }       from '../stages/parse-module.mjs';
import { planSlides }        from '../stages/plan-slides.mjs';
import { validatePlans }     from '../stages/validate-plans.mjs';
import { generateImages, cropRightPanel } from '../stages/image-gen.mjs';
import { generateComponents } from '../stages/component-gen.mjs';
import { screenshotSlides, buildPptx } from '../stages/export-pptx.mjs';
import { slugify }           from '../utils/slugify.mjs';

const argv      = minimist(process.argv.slice(2));
const inputFile = argv._[0];
if (!inputFile) { console.error('Usage: generate-slides.mjs <module.md>'); process.exit(1); }

const md   = readFileSync(inputFile, 'utf8');
const meta = {
  sessionLabel:      argv.session  ?? 'SESSION 1',
  moduleLabel:       argv.module   ?? 'MODULE 1',
  courseLabel:       argv.course   ?? 'AI+PRO',
  domain:            argv.domain   ?? 'aiplus.domain',
  globalSlideOffset: argv.offset   ?? 0,
  sourceFile:        inputFile,
};
const durationInFrames = parseInt(argv.duration ?? '150', 10);

console.log('\n🚀 AI+PRO Slide Generator (single module)\n');

const doc    = parseModule(md, meta);
const slug   = slugify(doc.moduleTitle);
const outDir = path.resolve(argv.out ?? './out', slug);
mkdirSync(outDir, { recursive: true });

console.log('🧠 Stage 2: Planning (Opus)…');
const plans = await planSlides(doc);
validatePlans(plans);
writeFileSync(path.join(outDir, 'plan.json'), JSON.stringify(plans, null, 2), 'utf8');
console.log(`   ${plans.length} slides planned`);

if (!argv['skip-images']) {
  console.log('\n🎨 Stage 3: Images (Gemini)…');
  const assetsDir = path.join(outDir, 'assets');
  await generateImages(plans, assetsDir);
  for (const p of plans) {
    if (p.rightPanel.imagePath) p.rightPanel.imagePath = await cropRightPanel(p.rightPanel.imagePath);
  }
}

console.log('\n⚛️  Stage 4: React components…');
generateComponents(plans, outDir, doc.moduleTitle, durationInFrames);

console.log('\n📊 Stage 5: PPTX…');
const screenshots = await screenshotSlides(plans.length, outDir);
await buildPptx(screenshots, path.join(outDir, 'export.pptx'), doc.moduleTitle);

console.log(`\n✅ Done → ${outDir}  (${plans.length} slides)`);
