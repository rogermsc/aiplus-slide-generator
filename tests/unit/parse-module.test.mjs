import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseModule } from '../../src/stages/parse-module.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixture = (name) => readFileSync(path.join(__dirname, 'fixtures', name), 'utf8');

const defaultMeta = {
  sessionLabel: 'SESSION 1',
  moduleLabel: 'MODULE 1',
  courseLabel: 'AI+PRO',
  domain: 'aiplus.domain',
  globalSlideOffset: 0,
};

let passed = 0, failed = 0;
function test(name, fn) {
  try { fn(); console.log(`  ✓ ${name}`); passed++; }
  catch (err) { console.error(`  ✗ ${name}: ${err.message}`); failed++; }
}
function assert(cond, msg) { if (!cond) throw new Error(msg); }

console.log('\n🧪 parse-module tests\n');

// Simple module
const simple = parseModule(fixture('module-simple.md'), defaultMeta);
test('extracts H1 as moduleTitle', () => {
  assert(simple.moduleTitle === 'Introduction to AI Ethics', `Got: ${simple.moduleTitle}`);
});
test('finds all H2/H3 sections', () => {
  assert(simple.sections.length >= 3, `Got ${simple.sections.length} sections`);
});
test('extracts bullets', () => {
  const s = simple.sections.find(s => s.heading === 'What is AI Ethics?');
  assert(s && s.bullets.length === 4, `Got ${s?.bullets.length} bullets`);
});
test('sets metadata correctly', () => {
  assert(simple.sessionLabel === 'SESSION 1', simple.sessionLabel);
  assert(simple.domain === 'aiplus.domain', simple.domain);
  assert(simple.globalSlideOffset === 0, String(simple.globalSlideOffset));
});

// Frontmatter module
const fm = parseModule(fixture('module-with-frontmatter.md'), defaultMeta);
test('strips YAML frontmatter', () => {
  assert(fm.moduleTitle === 'Data Privacy Fundamentals', `Got: ${fm.moduleTitle}`);
});
test('parses tables', () => {
  const s = fm.sections.find(s => s.heading === 'GDPR vs CCPA');
  assert(s && s.tables.length === 1, `Got ${s?.tables.length} tables`);
  assert(s.tables[0].length >= 3, `Table has ${s.tables[0].length} rows`);
});

// Tables module
const tables = parseModule(fixture('module-with-tables.md'), defaultMeta);
test('parses multiple tables', () => {
  const total = tables.sections.reduce((sum, s) => sum + s.tables.length, 0);
  assert(total === 2, `Got ${total} tables total`);
});

// No H1 module
const noH1 = parseModule(fixture('module-no-h1.md'), { ...defaultMeta, sourceFile: 'module-no-h1.md' });
test('falls back to filename slug when no H1', () => {
  assert(noH1.moduleTitle === 'module-no-h1', `Got: ${noH1.moduleTitle}`);
});

// Global offset
const withOffset = parseModule(fixture('module-simple.md'), { ...defaultMeta, globalSlideOffset: 15 });
test('preserves globalSlideOffset', () => {
  assert(withOffset.globalSlideOffset === 15, `Got: ${withOffset.globalSlideOffset}`);
});

console.log(`\n${'─'.repeat(42)}`);
console.log(`Passed: ${passed}  |  Failed: ${failed}  |  Total: ${passed + failed}`);
if (failed > 0) process.exit(1);
