import { writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';

export function generateComponents(plans, outDir, moduleTitle, durationInFrames = 150) {
  const slidesDir = path.join(outDir, 'slides');
  mkdirSync(slidesDir, { recursive: true });

  const exportLines = [];

  for (const plan of plans) {
    const nnn      = String(plan.index).padStart(3, '0');
    const filename = `Slide${nnn}.tsx`;
    const content  = renderComponent(plan, plans.length, moduleTitle, durationInFrames);
    writeFileSync(path.join(slidesDir, filename), content, 'utf8');
    exportLines.push(
      `export { default as Slide${nnn}, slideMeta as meta${nnn}, slideData as data${nnn} } from './slides/Slide${nnn}';`
    );
    console.log(`    ✓ ${filename} (Layout ${plan.layout}, global p.${plan.globalIndex})`);
  }

  const index = [
    '// AUTO-GENERATED INDEX — DO NOT EDIT BY HAND',
    `// Module:    ${moduleTitle}`,
    `// Generated: ${new Date().toISOString()}`,
    '',
    ...exportLines,
  ].join('\n');

  writeFileSync(path.join(outDir, 'index.ts'), index, 'utf8');
}

function renderComponent(plan, total, moduleTitle, durationInFrames) {
  const nnn     = String(plan.index).padStart(3, '0');
  const planStr = JSON.stringify(plan, null, 2)
    .split('\n')
    .map((l, i) => i === 0 ? l : `  ${l}`)
    .join('\n');

  return `// ─── AUTO-GENERATED — DO NOT EDIT BY HAND ───────────────────────────────
// Module:    ${moduleTitle}
// Slide:     ${plan.index} of ${total}  (global: ${plan.globalIndex})
// Layout:    ${plan.layout}
// Generated: ${new Date().toISOString()}
// ─────────────────────────────────────────────────────────────────────────

import React from 'react';
import { Layout${plan.layout} } from '../../components/layouts/Layout${plan.layout}';
import type { SlidePlan } from '../../types/slide.types';

// __SLIDE_DATA_START__
export const slideData: SlidePlan = ${planStr};
// __SLIDE_DATA_END__

export default function Slide${nnn}() {
  return <Layout${plan.layout} plan={slideData} />;
}

export const slideMeta = {
  durationInFrames: ${durationInFrames},
  fps:    30,
  width:  1440,
  height: 810,
} as const;
`;
}
