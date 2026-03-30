// Single module : node tests/qa/qa-report.mjs <module-out-dir>
// Full course   : node tests/qa/qa-report.mjs <course-out-dir> --course

import { readdirSync, readFileSync, existsSync } from 'node:fs';
import path from 'node:path';

const isCourse = process.argv.includes('--course');
const outDir   = process.argv.slice(2).find(a => !a.startsWith('-'));
if (!outDir) { console.error('Pass output directory as argument'); process.exit(1); }

let passed = 0, failed = 0;
function check(name, fn) {
  try   { fn(); console.log(`  ✓ ${name}`); passed++; }
  catch (err) { console.error(`  ✗ ${name}: ${err.message}`); failed++; }
}

// ── Course-level ──────────────────────────────────────────────────────────
if (isCourse) {
  console.log('\n🔍 Course-level\n');
  check('course-manifest.json exists', () => {
    if (!existsSync(path.join(outDir, 'course-manifest.json'))) throw new Error('missing');
  });
  const manifest = JSON.parse(readFileSync(path.join(outDir, 'course-manifest.json'), 'utf8'));
  check('totalSlides > 0', () => { if (manifest.totalSlides < 1) throw new Error(manifest.totalSlides); });
  check('modules array non-empty', () => { if (!manifest.modules?.length) throw new Error('empty'); });
  check('slide ranges are contiguous', () => {
    for (let i = 1; i < manifest.modules.length; i++) {
      const prev = manifest.modules[i - 1], curr = manifest.modules[i];
      if (curr.globalSlideStart !== prev.globalSlideEnd + 1)
        throw new Error(`Gap: "${prev.moduleTitle}" ends ${prev.globalSlideEnd}, "${curr.moduleTitle}" starts ${curr.globalSlideStart}`);
    }
  });
  check('totalSlides = sum of module slideCounts', () => {
    const sum = manifest.modules.reduce((a, m) => a + m.slideCount, 0);
    if (sum !== manifest.totalSlides) throw new Error(`${sum} ≠ ${manifest.totalSlides}`);
  });
}

// ── Module directories ────────────────────────────────────────────────────
const moduleDirs = isCourse
  ? readdirSync(outDir, { withFileTypes: true }).filter(d => d.isDirectory()).map(d => path.join(outDir, d.name))
  : [outDir];

for (const moduleDir of moduleDirs) {
  const name       = path.basename(moduleDir);
  const slidesDir  = path.join(moduleDir, 'slides');
  if (!existsSync(slidesDir)) continue;

  const slideFiles = readdirSync(slidesDir).filter(f => f.endsWith('.tsx')).sort();
  console.log(`\n🔍 ${name}  (${slideFiles.length} slides)\n`);

  // File structure
  check('plan.json exists',     () => { if (!existsSync(path.join(moduleDir, 'plan.json'))) throw new Error('missing'); });
  check('index.ts exists',      () => { if (!existsSync(path.join(moduleDir, 'index.ts'))) throw new Error('missing'); });
  check('export.pptx exists',   () => { if (!existsSync(path.join(moduleDir, 'export.pptx'))) throw new Error('missing'); });
  check('At least 1 slide',     () => { if (slideFiles.length < 1) throw new Error('0 slides'); });
  check('3-digit zero-padded filenames', () => {
    const bad = slideFiles.filter(f => !/^Slide\d{3}\.tsx$/.test(f));
    if (bad.length) throw new Error(bad.join(', '));
  });
  check('Sequential from Slide001', () => {
    slideFiles.forEach((f, i) => {
      const exp = `Slide${String(i + 1).padStart(3, '0')}.tsx`;
      if (f !== exp) throw new Error(`Expected ${exp}, got ${f}`);
    });
  });

  // Per-slide
  slideFiles.forEach(file => {
    const content = readFileSync(path.join(slidesDir, file), 'utf8');
    const n       = file.replace('.tsx', '');
    check(`${n}: AUTO-GENERATED header`,         () => { if (!content.includes('AUTO-GENERATED')) throw new Error(); });
    check(`${n}: slideMeta export`,               () => { if (!content.includes('export const slideMeta')) throw new Error(); });
    check(`${n}: slideData export`,               () => { if (!content.includes('export const slideData')) throw new Error(); });
    check(`${n}: layout component imported`,      () => { if (!content.match(/from '.*layouts\/Layout[A-G]'/)) throw new Error(); });
    check(`${n}: no useState / useEffect`,        () => { if (content.includes('useState') || content.includes('useEffect')) throw new Error(); });
    check(`${n}: no fetch / axios calls`,         () => { if (content.includes('fetch(') || content.includes('axios')) throw new Error(); });
    check(`${n}: canvas 1440×810`,                () => { if (!content.match(/width:\s+1440/) || !content.match(/height:\s+810/)) throw new Error(); });
    check(`${n}: __SLIDE_DATA_START__ marker`,    () => { if (!content.includes('__SLIDE_DATA_START__')) throw new Error(); });
  });

  // Design rules from plan.json
  let plans = [];
  try { plans = JSON.parse(readFileSync(path.join(moduleDir, 'plan.json'), 'utf8')); }
  catch { console.error('  ✗ Cannot load plan.json — skipping design checks'); continue; }

  check('First slide is Layout A', () => {
    if (plans[0]?.layout !== 'A') throw new Error(`Got ${plans[0]?.layout}`);
  });
  check('Last slide is Layout E or A', () => {
    const last = plans.at(-1);
    if (last?.layout !== 'E' && last?.layout !== 'A') throw new Error(`Got ${last?.layout}`);
  });
  check('Layout B = 4 cards', () => {
    plans.filter(p => p.layout === 'B').forEach(p => {
      if (p.cards?.length !== 4) throw new Error(`Slide ${p.index}: ${p.cards?.length}`);
    });
  });
  check('Layout C = 2 cards', () => {
    plans.filter(p => p.layout === 'C').forEach(p => {
      if (p.cards?.length !== 2) throw new Error(`Slide ${p.index}: ${p.cards?.length}`);
    });
  });
  check('Layout D = 2–4 steps', () => {
    plans.filter(p => p.layout === 'D').forEach(p => {
      const n = p.steps?.length ?? 0;
      if (n < 2 || n > 4) throw new Error(`Slide ${p.index}: ${n} steps`);
    });
  });
  check('Layout E = 4 summary items', () => {
    plans.filter(p => p.layout === 'E').forEach(p => {
      if (p.summaryItems?.length !== 4) throw new Error(`Slide ${p.index}`);
    });
  });
  check('Layout F = 3-6 iconItems', () => {
    plans.filter(p => p.layout === 'F').forEach(p => {
      const n = p.iconItems?.length ?? 0;
      if (n < 3 || n > 6) throw new Error(`Slide ${p.index}: ${n} iconItems`);
    });
  });
  check('Layout G = 2-4 stats', () => {
    plans.filter(p => p.layout === 'G').forEach(p => {
      const n = p.stats?.length ?? 0;
      if (n < 2 || n > 4) throw new Error(`Slide ${p.index}: ${n} stats`);
    });
  });
  check('No slide title > 80 chars', () => {
    plans.forEach(p => { if (p.slideTitle?.length > 80) throw new Error(`Slide ${p.index}`); });
  });
  check('All slides have breadcrumb', () => {
    plans.forEach(p => {
      if (!p.breadcrumb?.course || !p.breadcrumb?.session) throw new Error(`Slide ${p.index}`);
    });
  });
  check('globalIndex monotonically increasing', () => {
    for (let i = 1; i < plans.length; i++) {
      if (plans[i].globalIndex !== plans[i - 1].globalIndex + 1)
        throw new Error(`${plans[i-1].globalIndex} → ${plans[i].globalIndex}`);
    }
  });
  check('footer.pageNumber = globalIndex', () => {
    plans.forEach(p => {
      if (p.footer.pageNumber !== p.globalIndex)
        throw new Error(`Slide ${p.index}: pageNumber=${p.footer.pageNumber} ≠ globalIndex=${p.globalIndex}`);
    });
  });
  check('All slides have speakerNotes', () => {
    const missing = plans.filter(p => !p.speakerNotes?.trim());
    if (missing.length) throw new Error(`Missing on: ${missing.map(p => p.index).join(', ')}`);
  });
}

console.log(`\n${'─'.repeat(42)}`);
console.log(`Passed: ${passed}  |  Failed: ${failed}  |  Total: ${passed + failed}`);
if (failed > 0) { console.error('\n❌ QA FAILED'); process.exit(1); }
else console.log('\n✅ All checks passed');
