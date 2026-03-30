#!/usr/bin/env node
// node generate-course.mjs <course-dir> [--domain aiplus.domain] [--out ./out]
//                                       [--duration 150] [--critique] [--critique-passes 1]

import { readFileSync, readdirSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import path     from 'node:path';
import minimist from 'minimist';
import { parseModule }       from '../stages/parse-module.mjs';
import { planSlides }        from '../stages/plan-slides.mjs';
import { validatePlans }     from '../stages/validate-plans.mjs';
import { generateImages, cropRightPanel } from '../stages/image-gen.mjs';
import { generateComponents } from '../stages/component-gen.mjs';
import { critiqueAndFix }    from '../stages/critique-slides.mjs';
import { screenshotSlides, buildPptx } from '../stages/export-pptx.mjs';
import { startPreviewServer } from '../utils/preview-server.mjs';
import { slugify }           from '../utils/slugify.mjs';

const argv      = minimist(process.argv.slice(2));
const courseDir = argv._[0];
if (!courseDir) { console.error('Usage: generate-course.mjs <course-dir>'); process.exit(1); }

let courseMeta = { title: 'AI+PRO Course', slug: 'course', domain: 'aiplus.domain' };
const courseJsonPath = path.join(courseDir, 'course.json');
if (existsSync(courseJsonPath)) {
  try { courseMeta = { ...courseMeta, ...JSON.parse(readFileSync(courseJsonPath, 'utf8')) }; }
  catch (e) { console.warn('Could not parse course.json:', e.message); }
}

const domain           = argv.domain   ?? courseMeta.domain;
const durationInFrames = parseInt(argv.duration ?? '150', 10);
const doCritique       = argv.critique ?? false;
const critiquePasses   = Math.min(parseInt(argv['critique-passes'] ?? '1', 10), 3);
const outRoot          = path.resolve(argv.out ?? './out', courseMeta.slug);
mkdirSync(outRoot, { recursive: true });

const mdFiles = readdirSync(courseDir)
  .filter(f => f.endsWith('.md'))
  .sort()
  .map(f => path.join(courseDir, f));

if (!mdFiles.length) { console.error(`No .md files found in ${courseDir}`); process.exit(1); }

console.log(`\n🎓 AI+PRO Course Generator`);
console.log(`   "${courseMeta.title}"  —  ${mdFiles.length} modules\n`);

const manifestModules = [];
let   globalSlideOffset = 0;

for (let mi = 0; mi < mdFiles.length; mi++) {
  const mdPath   = mdFiles[mi];
  const basename = path.basename(mdPath, '.md');
  console.log(`\n── Module ${mi + 1}/${mdFiles.length}: ${basename} ──`);

  const md  = readFileSync(mdPath, 'utf8');
  const doc = parseModule(md, {
    sessionLabel:      `SESSION ${mi + 1}`,
    moduleLabel:       `MODULE ${mi + 1}`,
    courseLabel:       courseMeta.title,
    domain,
    globalSlideOffset,
    sourceFile:        mdPath,
  });

  const moduleSlug   = slugify(doc.moduleTitle);
  const moduleOutDir = path.join(outRoot, `${String(mi + 1).padStart(2, '0')}-${moduleSlug}`);
  mkdirSync(moduleOutDir, { recursive: true });

  // Stage 2
  console.log('  🧠 Planning (Opus)…');
  let plans = await planSlides(doc);
  validatePlans(plans);
  writeFileSync(path.join(moduleOutDir, 'plan.json'), JSON.stringify(plans, null, 2), 'utf8');
  console.log(`     → ${plans.length} slides  (global ${globalSlideOffset + 1}–${globalSlideOffset + plans.length})`);

  // Stage 3
  console.log('  🎨 Images (Gemini)…');
  const assetsDir = path.join(moduleOutDir, 'assets');
  await generateImages(plans, assetsDir);
  for (const p of plans) {
    if (p.rightPanel.imagePath) p.rightPanel.imagePath = await cropRightPanel(p.rightPanel.imagePath);
  }

  // Stage 4
  console.log('  ⚛️  React components…');
  generateComponents(plans, moduleOutDir, doc.moduleTitle, durationInFrames);

  // Stage 4.5 (optional)
  if (doCritique) {
    console.log('  🔍 Visual critique…');
    plans = await critiqueAndFix(plans, moduleOutDir, doc.moduleTitle, {
      passes: critiquePasses, durationInFrames,
    });
    writeFileSync(path.join(moduleOutDir, 'plan.json'), JSON.stringify(plans, null, 2), 'utf8');
  }

  // Stage 5
  console.log('  📊 PPTX…');
  const pptxPath = path.join(moduleOutDir, 'export.pptx');
  const server = await startPreviewServer(moduleOutDir, 5175);
  try {
    const screenshots = await screenshotSlides(plans.length, moduleOutDir, server.url);
    await buildPptx(screenshots, pptxPath, doc.moduleTitle);
  } finally {
    await server.stop();
  }

  manifestModules.push({
    moduleSlug,
    moduleTitle:      doc.moduleTitle,
    slideCount:       plans.length,
    globalSlideStart: globalSlideOffset + 1,
    globalSlideEnd:   globalSlideOffset + plans.length,
    componentDir:     path.relative(outRoot, path.join(moduleOutDir, 'slides')),
    pptxPath:         path.relative(outRoot, pptxPath),
  });

  globalSlideOffset += plans.length;
  console.log(`  ✅ Module done. Course total so far: ${globalSlideOffset} slides`);
}

const manifest = {
  courseTitle:  courseMeta.title,
  courseSlug:   courseMeta.slug,
  generatedAt:  new Date().toISOString(),
  totalSlides:  globalSlideOffset,
  modules:      manifestModules,
};
writeFileSync(path.join(outRoot, 'course-manifest.json'), JSON.stringify(manifest, null, 2), 'utf8');

console.log(`\n\n🎉 Course complete`);
console.log(`   Total slides : ${globalSlideOffset}`);
console.log(`   Modules      : ${mdFiles.length}`);
console.log(`   Output       : ${outRoot}`);
