import Anthropic from '@anthropic-ai/sdk';
import { generateComponents } from './component-gen.mjs';
import { validatePlans }      from './validate-plans.mjs';
import { startPreviewServer } from '../utils/preview-server.mjs';
import { screenshotToBase64 } from '../utils/screenshot.mjs';
import { applyFixes }         from '../utils/apply-fixes.mjs';
import { retry }              from '../utils/retry.mjs';

let _client = null;
function getClient() {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error('ANTHROPIC_API_KEY is not set');
  if (!_client) _client = new Anthropic({ apiKey: key });
  return _client;
}

const CRITIQUE_PROMPT = `
You are a senior presentation designer reviewing AI-generated educational slides.
You receive screenshots of rendered slides alongside their JSON plan data.

Your job: identify visual and content problems, then return SPECIFIC fixes as JSON.

EVALUATE EACH SLIDE ON:
1. **Canvas utilization** — Does content fill at least 60% of the 1440×810 canvas? Large empty areas are a failure.
2. **Layout fitness** — Is the chosen layout the best for this content? Would a different layout (A-G) work better?
   - Layout A: full-width content (body, bullets, quote, transformation, checklist, table, stats)
   - Layout B: 2×2 card grid (exactly 4 items)
   - Layout C: two-column comparison (exactly 2 items with bullet lists)
   - Layout D: numbered steps (2-4 sequential steps)
   - Layout E: summary (4 numbered takeaways)
   - Layout F: icon/feature grid (3-6 items with emoji + title + body)
   - Layout G: stats + content (2-4 stat callouts + optional body/quote/bullets)
3. **Content density** — Is there enough text? Educational slides should be information-rich. Body should be 3-5 sentences. Card bodies 2-3 sentences.
4. **Visual variety** — Does the deck use diverse layouts, or is it repetitive? Flag if 3+ consecutive slides use the same layout.
5. **Content types** — Could the content benefit from stats, iconItems, bullets, quote, or transformation blocks that aren't currently used?

RETURN FORMAT — JSON array, one entry per slide that needs fixes:
[
  {
    "slideIndex": 2,
    "issues": ["Body text too short — only fills 20% of canvas", "Would be better as Layout F icon grid"],
    "fixes": [
      { "field": "layout", "value": "F" },
      { "field": "iconItems", "value": [{"icon": "⚖️", "title": "Fairness", "body": "..."}, ...] },
      { "field": "body", "action": "delete" },
      { "field": "cards", "action": "delete" }
    ]
  }
]

RULES:
- Only include slides that need fixes. If a slide is good, omit it.
- "field" must be a valid SlidePlan field name.
- "action": "delete" removes the field. Otherwise provide "value" with the replacement.
- When changing layout, provide ALL required fields for the new layout.
- NEVER modify: index, globalIndex, breadcrumb, footer, rightPanel, imagePrompt.
- Keep existing speakerNotes unless they conflict with content changes.
- Return ONLY valid JSON. No markdown fences, no explanation.
- If all slides are acceptable, return an empty array: []
- CRITICAL: Your entire response must be ONLY a JSON array. No text before or after. Start with [ and end with ].
`.trim();

/**
 * Visual critique loop: render → screenshot → critique → fix → re-render.
 * @param {import('../types/slide.types').SlidePlan[]} plans
 * @param {string} outDir
 * @param {string} moduleTitle
 * @param {object} options
 * @returns {Promise<import('../types/slide.types').SlidePlan[]>}
 */
export async function critiqueAndFix(plans, outDir, moduleTitle, options = {}) {
  const { passes = 1, durationInFrames = 150 } = options;
  let currentPlans = plans;

  for (let pass = 0; pass < passes; pass++) {
    console.log(`  [critique] Pass ${pass + 1}/${passes}…`);

    // 1. Generate components from current plans
    generateComponents(currentPlans, outDir, moduleTitle, durationInFrames);

    // 2. Start preview server
    console.log('    Starting preview server…');
    const server = await startPreviewServer(outDir);

    try {
      // 3. Screenshot all slides
      console.log(`    Screenshotting ${currentPlans.length} slides…`);
      const screenshots = await screenshotToBase64(currentPlans.length, server.url);

      // 4. Send to Claude vision
      console.log('    Sending to Claude vision for critique…');
      const critique = await visionCritique(currentPlans, screenshots);

      if (critique.length === 0) {
        console.log('    ✓ All slides passed critique — no fixes needed');
        break;
      }

      console.log(`    ${critique.length} slide(s) need fixes`);
      for (const item of critique) {
        console.log(`      Slide ${item.slideIndex}: ${item.issues?.[0] ?? 'fix applied'}`);
      }

      // 5. Apply fixes
      currentPlans = applyFixes(currentPlans, critique);

      // 6. Validate
      try {
        validatePlans(currentPlans);
      } catch (err) {
        console.warn(`    ⚠ Validation failed after fixes, reverting: ${err.message}`);
        currentPlans = plans; // Revert to original
        break;
      }

      // 7. Re-generate components
      generateComponents(currentPlans, outDir, moduleTitle, durationInFrames);
      console.log(`    ✓ Pass ${pass + 1} complete — ${critique.length} fixes applied`);

    } finally {
      await server.stop();
    }
  }

  return currentPlans;
}

async function visionCritique(plans, screenshots) {
  // Build message content: alternating images and plan JSON
  const content = [];

  content.push({
    type: 'text',
    text: `I'm reviewing a ${plans.length}-slide educational presentation. Here are the rendered screenshots and plan data for each slide:`,
  });

  for (const ss of screenshots) {
    const plan = plans.find(p => p.index === ss.index);
    content.push({
      type: 'image',
      source: { type: 'base64', media_type: 'image/png', data: ss.base64 },
    });
    content.push({
      type: 'text',
      text: `SLIDE ${ss.index} (Layout ${plan?.layout}): ${JSON.stringify(plan, null, 0).slice(0, 800)}`,
    });
  }

  content.push({
    type: 'text',
    text: 'Now critique these slides and return the fixes JSON array.',
  });

  const response = await retry(
    () => getClient().messages.create({
      model:       'claude-sonnet-4-6',
      max_tokens:  16000,
      temperature: 0.2,
      system:      CRITIQUE_PROMPT,
      messages:    [{ role: 'user', content }],
    }),
    { attempts: 2, delayMs: 5000, backoffMultiplier: 2 }
  );

  const raw = response.content
    .filter(b => b.type === 'text')
    .map(b => b.text)
    .join('');

  const cleaned = raw
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  try {
    const parsed = JSON.parse(cleaned);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch (err) {
    console.warn(`    ⚠ Could not parse critique response: ${err.message}`);
    return [];
  }
}
