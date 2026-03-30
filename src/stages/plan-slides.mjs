import Anthropic        from '@anthropic-ai/sdk';
import fs               from 'node:fs/promises';
import path             from 'node:path';
import { fileURLToPath } from 'node:url';
import { retry }        from '../utils/retry.mjs';
import { validatePlans } from './validate-plans.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SECTIONS_PER_CHUNK = parseInt(process.env.SECTIONS_PER_CHUNK ?? '8', 10);
const CHUNK_OVERLAP      = 1;

let _client = null;
function getClient() {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error('ANTHROPIC_API_KEY is not set');
  if (!_client) _client = new Anthropic({ apiKey: key });
  return _client;
}

export const SYSTEM_PROMPT = `
You are an expert instructional designer and visual slide architect for AI+PRO,
a professional training platform. You receive a parsed module document and must
output a complete slide deck plan as a JSON array of SlidePlan objects.

DESIGN PHILOSOPHY:
These are EDUCATIONAL slides. Content must be DENSE and information-rich.
Slides use FULL-WIDTH layouts. Content spans the entire 1440px canvas.
Photos appear as small inline thumbnails within content bands.
The rightPanel field controls photo generation: type "photo" generates an inline thumbnail via Gemini, type "blob" means no photo (decorative corner only).

STYLE GUIDE CONSTRAINTS (non-negotiable):
- Canvas: 1440×810px, 16:9, full-width content
- Background: lavender gradient (content slides) or dark navy (opener slide)
- Title font: Bold 700, color #524ED6, 46pt (opener: 52pt white on dark)
- Lead subheading: Semibold 600, color #534AB7, 18pt
- Body text: Regular 400, color #1A1340, 15–16pt, line-height 1.7
- Cards: white glass, top border colored (alternating purple/orange), 22px padding
- Amber callout: bg #FBBD23, bold text — MAX ONE per slide
- Step items: full-width content bands with colored left border
- Breadcrumb: 10pt ALL-CAPS #7F77DD
- Footer: bottom-right, domain + page number
- Small decorative corner blob top-right (NOT a content panel)

LAYOUT SELECTION RULES:
- Layout A (Full-Width Content): module opener (dark bg), section openers, concept slides, checklist slides, quote slides, transformation slides. Full canvas width. Supports: body, bullets, stats, quote, transformation, checklistItems, tableData.
- Layout B (2×2 Card Grid): exactly 4 parallel items — overviews, objectives, feature lists
- Layout C (Two-Column Comparison): exactly 2 options with colored header bars. Cards can include bullets[] for detailed points.
- Layout D (Numbered Steps): 2–4 sequential steps as full-width content bands
- Layout E (Summary/Closing): end-of-module recap with 4 numbered cards
- Layout F (Icon/Feature Grid): 3–6 items with emoji icons — for feature lists, capabilities, skill sets. Each item needs icon (emoji), title, and body.
- Layout G (Stats + Content): 2–4 key metrics/statistics with optional body, quote, or bullets below. Use for data-driven slides, impact summaries, key findings.

SLIDE SEQUENCE RULES:
1. First slide MUST be Layout A — dark background module opener with blob rightPanel
2. Last slide MUST be Layout E (summary) or Layout A (Q&A / closing)
3. Each slide must be self-contained — no "continued" slides
4. Body text: 3–5 sentences for educational depth. Be thorough. Include examples, context, and implications.
5. Card body text: 2–3 sentences each. Cards should feel FULL, not sparse.
6. callout: include ONLY for the single most critical rule on a slide. Omit otherwise.
7. rightPanel.type: "photo" for real-world subjects (displayed as inline thumbnail); "blob" for abstract
8. imagePrompt: required when rightPanel.type is "photo". Describe subject, lighting, mood.
   Always end with: "semi-desaturated, professional, 16:9 composition."
   Never reference specific real people by name.
9. speakerNotes: always include 2–4 sentence presenter script per slide.
10. globalIndex = globalSlideOffset + localIndex. footer.pageNumber must equal globalIndex.

RICH CONTENT TYPES (use these to create visually diverse slides):
- bullets: Array of BulletGroup objects [{title?, items: string[]}]. Use for multi-column bullet lists (2-3 groups). Great for listing features, requirements, or categories side by side.
- stats: Array of StatItem objects [{value, label, context?}]. value is a metric like "42%", "3x", "$1.2M". label is what it measures. context is optional explanation. MUST use Layout G.
- quote: QuoteData object {text, attribution?}. Use for important quotes, provocative questions, or key statements. Use in Layout A.
- iconItems: Array of IconItem objects [{icon, title, body}]. icon is a SINGLE emoji character. Use for feature grids, capability lists. MUST use Layout F.
- transformation: Transformation object {before: {title, items[]}, after: {title, items[]}}. Use for before/after, old/new comparisons. Use in Layout A.

CONTENT-DENSITY RULES (CRITICAL):
Educational slides should be DENSE and VARIED. Mix content types for visual diversity.
- Body paragraphs: 3–5 sentences with real examples and context
- Card bodies: 2–3 complete sentences, not fragments
- Use stats when the source mentions numbers, percentages, or metrics
- Use iconItems when listing 3-6 features or capabilities with distinct identities
- Use bullets for organized multi-column information
- Use quote for important statements, definitions, or provocative questions
- Use transformation when showing change over time (before/after, old/new approach)
- VARY the layouts across a deck. Don't use Layout A for every content slide. Use F and G when the content fits.
- Every piece of source content must appear in at least one slide

SLIDE ALLOCATION:
  • Module opener                → 1 slide (Layout A, blob, dark background)
  • H2 section heading           → 1 Layout A section-opener (title + lead + body)
  • Definition / concept         → 1 Layout A with thorough body text
  • Bullet list of exactly 4     → 1 Layout B
  • Comparison of exactly 2      → 1 Layout C
  • 2–4 step process             → 1 Layout D
  • Bullet list of 5+ items      → split: Layout A with bullets (2-3 columns), or multiple Layout B
  • Data table                   → 1 Layout A with tableData
  • Key statistics / metrics     → 1 Layout G with stats (2-4 items)
  • Feature / capability list    → 1 Layout F with iconItems (3-6 items with emoji)
  • Before/after comparison      → 1 Layout A with transformation
  • Important quote / statement  → 1 Layout A with quote
  • Multi-column bullet content  → 1 Layout A with bullets (2-3 groups)
  • Self-check / reflection      → 1 Layout A with checklistItems
  • Module summary               → 1 Layout E (last slide)

OUTPUT FORMAT:
Return ONLY a valid JSON array. No markdown fences, no explanation, no preamble.
Schema: SlidePlan[] as defined in the type contract provided.

WRITING VOICE:
- Direct and confident. No filler phrases.
- Sentence case everywhere except breadcrumb (ALL-CAPS)
- Oxford comma in lists
- Educational tone: explain concepts fully, use examples
`.trim();

/**
 * Plan slides for a module. Automatically chunks large modules.
 * @param {import('../types/slide.types').ModuleDoc} doc
 * @returns {Promise<import('../types/slide.types').SlidePlan[]>}
 */
export async function planSlides(doc) {
  const typesPath      = path.resolve(__dirname, '../types/slide.types.ts');
  const typeSchemaJSON = await fs.readFile(typesPath, 'utf8');

  if (doc.sections.length <= SECTIONS_PER_CHUNK) {
    return singleCall(doc, doc.sections, typeSchemaJSON, doc.globalSlideOffset, 0, undefined);
  }

  console.log(`  [plan] Large module (${doc.sections.length} sections) — chunking…`);
  const chunks    = chunkSections(doc.sections, SECTIONS_PER_CHUNK, CHUNK_OVERLAP);
  const allPlans  = [];
  let   idxOffset = 0;

  for (let ci = 0; ci < chunks.length; ci++) {
    const role = ci === 0 ? 'opener' : ci === chunks.length - 1 ? 'closer' : 'middle';
    console.log(`  [plan] Chunk ${ci + 1}/${chunks.length} (${chunks[ci].length} sections, role: ${role})…`);

    const chunkPlans = await singleCall(
      doc, chunks[ci], typeSchemaJSON,
      doc.globalSlideOffset + idxOffset, idxOffset, role
    );

    const deduped = ci === 0
      ? chunkPlans
      : chunkPlans.filter(p => !allPlans.some(e => e.slideTitle === p.slideTitle));

    allPlans.push(...deduped);
    idxOffset += deduped.length;
  }

  return allPlans.map((p, i) => ({
    ...p,
    index:       i + 1,
    globalIndex: doc.globalSlideOffset + i + 1,
    footer:      { ...p.footer, pageNumber: doc.globalSlideOffset + i + 1 },
  }));
}

async function singleCall(doc, sections, typeSchemaJSON, globalOffset, localOffset, chunkRole) {
  const chunkHint = buildChunkHint(chunkRole);
  const userPrompt = buildUserPrompt(doc, sections, typeSchemaJSON, globalOffset, localOffset, chunkHint);

  const estimatedTokens = Math.ceil(userPrompt.length / 3.5);
  if (estimatedTokens > 60000)
    console.warn(`  [plan] Prompt ~${estimatedTokens} tokens — consider reducing SECTIONS_PER_CHUNK`);

  const response = await retry(
    () => getClient().messages.create({
      model:       'claude-opus-4-6',
      max_tokens:  32000,
      temperature: 0.3,
      system:      SYSTEM_PROMPT,
      messages:    [{ role: 'user', content: userPrompt }],
    }),
    { attempts: 3, delayMs: 5000, backoffMultiplier: 2 }
  );

  const raw = response.content
    .filter(b => b.type === 'text')
    .map(b => b.text)
    .join('');

  return parseAndNormalize(raw, doc, localOffset, globalOffset, !!chunkRole);
}

function buildChunkHint(role) {
  if (!role) return '';
  const hints = {
    opener: 'CHUNK ROLE: opener. Include the module opener slide (Layout A, blob) as slide 1.',
    middle: 'CHUNK ROLE: middle. Do NOT add an opener or summary — those are in other chunks.',
    closer: 'CHUNK ROLE: closer. Include the module summary slide (Layout E) as the final slide.',
  };
  return `\n\n${hints[role]}`;
}

function buildUserPrompt(doc, sections, typeSchemaJSON, globalOffset, localOffset, chunkHint) {
  return `
TYPE CONTRACT:
${typeSchemaJSON}

MODULE METADATA:
Title:               ${doc.moduleTitle}
Course:              ${doc.courseLabel}
Session:             ${doc.sessionLabel}
Module:              ${doc.moduleLabel}
Domain:              ${doc.domain}
Global slide offset: ${globalOffset}
Local index offset:  ${localOffset}
${chunkHint}

SECTIONS:
${sections.map((s, i) => `
--- SECTION ${i + 1}: ${s.heading} ---
Body: ${s.body || '(none)'}
Bullets:
${s.bullets.length ? s.bullets.map(b => `  • ${b}`).join('\n') : '  (none)'}
Tables: ${s.tables.length ? JSON.stringify(s.tables) : '(none)'}
Code blocks: ${s.codeBlocks.length ? s.codeBlocks.map(c => `\n\`\`\`\n${c}\n\`\`\``).join('\n') : '(none)'}
`).join('\n')}

Generate the SlidePlan[] array for the sections above now.
`.trim();
}

async function parseAndNormalize(raw, doc, localOffset, globalOffset, isChunk = false) {
  const cleaned = raw
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  let plans;
  try {
    const parsed = JSON.parse(cleaned);
    if (!Array.isArray(parsed)) throw new Error('Not an array');
    plans = parsed;
  } catch (err) {
    console.error('[plan] JSON parse failed, requesting repair:', err.message);
    plans = await repairWithOpus(cleaned);
  }

  const normalized = plans.map((p, i) => ({
    ...p,
    index:       localOffset + i + 1,
    globalIndex: globalOffset + i + 1,
    // Zero-pad summary item numbers if needed
    ...(p.summaryItems ? {
      summaryItems: p.summaryItems.map(item => ({
        ...item,
        number: String(item.number).padStart(2, '0'),
      })),
    } : {}),
    footer: {
      domain:     p.footer?.domain ?? doc.domain,
      pageNumber: globalOffset + i + 1,
    },
  }));

  validatePlans(normalized, { partial: isChunk });
  return normalized;
}

async function repairWithOpus(brokenJson) {
  const response = await retry(
    () => getClient().messages.create({
      model:       'claude-opus-4-6',
      max_tokens:  32000,
      temperature: 0,
      messages: [{
        role:    'user',
        content: `Fix all JSON syntax errors in the array below.
Return ONLY the corrected JSON array. No markdown fences, no explanation.

${brokenJson}`,
      }],
    }),
    { attempts: 2, delayMs: 5000, backoffMultiplier: 1 }
  );
  const text = response.content.filter(b => b.type === 'text').map(b => b.text).join('');
  return JSON.parse(text);
}

function chunkSections(sections, size, overlap) {
  const chunks = [];
  let i = 0;
  while (i < sections.length) {
    chunks.push(sections.slice(i, i + size));
    i += size - overlap;
  }
  return chunks;
}
