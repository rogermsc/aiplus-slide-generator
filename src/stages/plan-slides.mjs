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

STYLE GUIDE CONSTRAINTS (non-negotiable):
- Canvas: 1440×810px, 16:9
- Background: linear-gradient(135deg,#E8DEFA 0%,#D8C8F6 40%,#C5B6F0 70%,#A8C8F8 100%)
- Title font: Bold 700, color #534AB7 or #1A1340, 36–44pt
- Lead subheading: Bold 700, color #534AB7, 15–17pt
- Body text: Regular 400, color #1A1340, 13–15pt, line-height 1.65
- Cards: bg rgba(255,255,255,0.72), border 1px rgba(100,80,200,0.15), radius 10px
- Amber callout: bg #FBBD23, text #1A1340 bold — MAX ONE per slide, only for the single most critical rule
- Step icons: odd bg #E8823A, even bg #534AB7, 30px, radius 6px
- Breadcrumb: 9–10pt ALL-CAPS #7F77DD, format: "COURSE NAME ——— SESSION N: SECTION NAME ——— MODULE N: MODULE TITLE"
- Footer: bottom-right, "domain + global page number", color #534AB7

LAYOUT SELECTION RULES:
- Layout A (Hero Split): module opener, section openers, single-rule or concept slides with a strong visual
- Layout B (2×2 Card Grid): exactly 4 parallel items — overviews, objectives, feature lists
- Layout C (Comparison 2-col): exactly 2 options — public vs private, before/after, A vs B
- Layout D (Numbered Steps): 2–4 sequential steps or warnings
- Layout E (Summary/Closing): end-of-module recap with exactly 4 takeaways + italic tagline

SLIDE SEQUENCE RULES:
1. First slide MUST be Layout A — module opener, blob right panel, large H1 title
2. Last slide MUST be Layout E (summary) or Layout A (Q&A / closing)
3. Each slide must be self-contained — no "continued" slides
4. Body text: max 3 sentences, plain language, no jargon without explanation
5. callout: include ONLY for the single most critical rule on a slide. Omit otherwise.
6. rightPanel.type: "photo" for human, technology, or real-world subjects; "blob" for abstract/conceptual
7. imagePrompt: required whenever rightPanel.type is "photo". Describe subject, lighting, mood, composition.
   Always end with: "semi-desaturated, professional, 16:9 composition, right-half crop focus."
   Never reference specific real people by name.
8. speakerNotes: always include a 2–4 sentence presenter script per slide in plain conversational language.
9. globalIndex: set to (globalSlideOffset + localIndex) for each slide. Both values are in the module metadata.
10. footer.pageNumber: must equal globalIndex for every slide.

CONTENT-DENSITY SLIDE ALLOCATION:
Let the source content drive the slide count. There is no minimum or maximum.
Apply these rules for each section in the module:

  • Module opener                → 1 slide (Layout A, blob)
  • H2 section heading           → 1 Layout A section-opener (title + lead only)
  • Definition / concept         → 1 Layout A
  • Bullet list of exactly 4     → 1 Layout B
  • Comparison of exactly 2      → 1 Layout C
  • 2–4 step process             → 1 Layout D
  • Bullet list of 5+ items      → split: multiple Layout B or Layout A slides (never crowd)
  • Data table                   → 1 Layout A or B with tableData populated
  • Self-check / reflection      → 1 Layout A with checklistItems populated
  • Module summary               → 1 Layout E (last slide)

NEVER sacrifice comprehensiveness for brevity. Every piece of information in the source
must appear in at least one slide. When in doubt, use an extra slide rather than crowding.

OUTPUT FORMAT:
Return ONLY a valid JSON array. No markdown fences, no explanation, no preamble.
Schema: SlidePlan[] as defined in the type contract provided.

WRITING VOICE:
- Direct and confident. No filler phrases ("It is important to note that…")
- Sentence case everywhere except breadcrumb (ALL-CAPS)
- Oxford comma in lists
- Max 15 words per bullet or card body sentence
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

  return parseAndNormalize(raw, doc, localOffset, globalOffset);
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

async function parseAndNormalize(raw, doc, localOffset, globalOffset) {
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
    footer: {
      domain:     p.footer?.domain ?? doc.domain,
      pageNumber: globalOffset + i + 1,
    },
  }));

  validatePlans(normalized);
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
