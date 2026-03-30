import { validatePlans } from '../../src/stages/validate-plans.mjs';

let passed = 0, failed = 0;
function test(name, fn) {
  try { fn(); console.log(`  ✓ ${name}`); passed++; }
  catch (err) { console.error(`  ✗ ${name}: ${err.message}`); failed++; }
}

function basePlan(overrides = {}) {
  return {
    index: 1, globalIndex: 1, layout: 'A',
    slideTitle: 'Test Slide',
    rightPanel: { type: 'blob' },
    breadcrumb: { course: 'AI+PRO', session: 'SESSION 1', module: 'MODULE 1' },
    footer: { domain: 'aiplus.domain', pageNumber: 1 },
    speakerNotes: 'This is a test speaker note for the slide.',
    ...overrides,
  };
}

function summaryPlan(index, globalIndex) {
  return basePlan({
    index, globalIndex, layout: 'E',
    slideTitle: 'Module Summary',
    summaryItems: [
      { number: '01', title: 'Item 1' },
      { number: '02', title: 'Item 2' },
      { number: '03', title: 'Item 3' },
      { number: '04', title: 'Item 4' },
    ],
    footer: { domain: 'aiplus.domain', pageNumber: globalIndex },
  });
}

console.log('\n🧪 validate-plans tests\n');

test('accepts valid 2-slide deck (A + E)', () => {
  validatePlans([basePlan(), summaryPlan(2, 2)]);
});

test('rejects empty array', () => {
  try { validatePlans([]); throw new Error('should have thrown'); }
  catch (e) { if (!e.message.includes('empty')) throw e; }
});

test('rejects first slide not Layout A', () => {
  try {
    validatePlans([basePlan({ layout: 'B', cards: [
      { title: 'a', body: 'b' }, { title: 'c', body: 'd' },
      { title: 'e', body: 'f' }, { title: 'g', body: 'h' },
    ] })]);
    throw new Error('should have thrown');
  } catch (e) { if (!e.message.includes('Layout A')) throw e; }
});

test('rejects Layout B without exactly 4 cards', () => {
  try {
    validatePlans([
      basePlan(),
      basePlan({ index: 2, globalIndex: 2, layout: 'B', cards: [{ title: 'a', body: 'b' }], footer: { domain: 'aiplus.domain', pageNumber: 2 }, speakerNotes: 'Notes.' }),
      summaryPlan(3, 3),
    ]);
    throw new Error('should have thrown');
  } catch (e) { if (!e.message.includes('validation')) throw e; }
});

test('rejects globalIndex gap', () => {
  try {
    validatePlans([
      basePlan(),
      basePlan({ index: 2, globalIndex: 3, footer: { domain: 'aiplus.domain', pageNumber: 3 }, speakerNotes: 'Notes.' }),
    ]);
    throw new Error('should have thrown');
  } catch (e) { if (!e.message.includes('gap')) throw e; }
});

test('rejects pageNumber != globalIndex', () => {
  try {
    validatePlans([
      basePlan({ footer: { domain: 'aiplus.domain', pageNumber: 99 } }),
    ]);
    throw new Error('should have thrown');
  } catch (e) { if (!e.message.includes('validation')) throw e; }
});

console.log(`\n${'─'.repeat(42)}`);
console.log(`Passed: ${passed}  |  Failed: ${failed}  |  Total: ${passed + failed}`);
if (failed > 0) process.exit(1);
