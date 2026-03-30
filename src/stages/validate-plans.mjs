import { z } from 'zod';

const CardItemSchema    = z.object({ title: z.string().min(1), body: z.string().min(1), bullets: z.array(z.string()).optional() });
const StepItemSchema    = z.object({ number: z.number().int().positive(), title: z.string(), body: z.string() });
const SummaryItemSchema = z.object({ number: z.string().regex(/^\d{1,2}$/), title: z.string() });

const BulletGroupSchema = z.object({ title: z.string().optional(), items: z.array(z.string().min(1)).min(1).max(12) });
const StatItemSchema    = z.object({ value: z.string().min(1).max(20), label: z.string().min(1).max(80), context: z.string().max(200).optional() });
const QuoteDataSchema   = z.object({ text: z.string().min(1).max(500), attribution: z.string().max(100).optional() });
const IconItemSchema    = z.object({ icon: z.string().min(1).max(4), title: z.string().min(1).max(80), body: z.string().min(1).max(500) });
const TransformationSchema = z.object({
  before: z.object({ title: z.string().min(1), items: z.array(z.string()).min(1).max(6) }),
  after:  z.object({ title: z.string().min(1), items: z.array(z.string()).min(1).max(6) }),
});

const SlidePlanSchema = z.object({
  index:           z.number().int().positive(),
  globalIndex:     z.number().int().positive(),
  layout:          z.enum(['A', 'B', 'C', 'D', 'E', 'F', 'G']),
  slideTitle:      z.string().min(1).max(100),
  leadSubheading:  z.string().max(160).optional(),
  body:            z.string().max(1200).optional(),
  cards:           z.array(CardItemSchema).optional(),
  steps:           z.array(StepItemSchema).optional(),
  summaryItems:    z.array(SummaryItemSchema).optional(),
  tableData:       z.object({ headers: z.array(z.string()), rows: z.array(z.array(z.string())) }).optional(),
  checklistItems:  z.array(z.string()).optional(),
  bullets:         z.array(BulletGroupSchema).min(1).max(4).optional(),
  stats:           z.array(StatItemSchema).min(1).max(4).optional(),
  quote:           QuoteDataSchema.optional(),
  iconItems:       z.array(IconItemSchema).min(3).max(6).optional(),
  transformation:  TransformationSchema.optional(),
  callout:         z.string().max(300).optional(),
  speakerNotes:    z.string().max(800).optional(),
  rightPanel:      z.object({ type: z.enum(['photo', 'blob']), imagePath: z.string().optional() }),
  breadcrumb:      z.object({ course: z.string().min(1), session: z.string().min(1), module: z.string().min(1) }),
  footer:          z.object({ domain: z.string().min(1), pageNumber: z.number().int().positive() }),
  imagePrompt:     z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.layout === 'B' && data.cards?.length !== 4)
    ctx.addIssue({ code: 'custom', path: ['cards'],        message: 'Layout B requires exactly 4 cards' });
  if (data.layout === 'C' && data.cards?.length !== 2)
    ctx.addIssue({ code: 'custom', path: ['cards'],        message: 'Layout C requires exactly 2 cards' });
  if (data.layout === 'D' && (!data.steps || data.steps.length < 2 || data.steps.length > 4))
    ctx.addIssue({ code: 'custom', path: ['steps'],        message: 'Layout D requires 2–4 steps' });
  if (data.layout === 'E' && data.summaryItems?.length !== 4)
    ctx.addIssue({ code: 'custom', path: ['summaryItems'], message: 'Layout E requires exactly 4 summary items' });
  if (data.layout === 'F' && (!data.iconItems || data.iconItems.length < 3 || data.iconItems.length > 6))
    ctx.addIssue({ code: 'custom', path: ['iconItems'],    message: 'Layout F requires 3-6 iconItems' });
  if (data.layout === 'G' && (!data.stats || data.stats.length < 1 || data.stats.length > 4))
    ctx.addIssue({ code: 'custom', path: ['stats'],        message: 'Layout G requires 2-4 stats' });
  if (data.rightPanel.type === 'photo' && !data.imagePrompt)
    ctx.addIssue({ code: 'custom', path: ['imagePrompt'],  message: 'Photo panel slides must include imagePrompt' });
  if (data.footer.pageNumber !== data.globalIndex)
    ctx.addIssue({ code: 'custom', path: ['footer'],       message: `pageNumber (${data.footer.pageNumber}) must equal globalIndex (${data.globalIndex})` });

  // Field-layout enforcement: warn about content that won't render
  const contentSupport = {
    A: ['body','tableData','checklistItems','bullets','stats','quote','transformation','callout','cards'],
    B: ['cards','callout','body'],
    C: ['cards','body','callout'],
    D: ['steps','callout','body'],
    E: ['summaryItems','body'],
    F: ['iconItems','body','callout'],
    G: ['stats','body','quote','bullets','callout'],
  };
  const contentFields = ['body','cards','steps','summaryItems','tableData','checklistItems','bullets','stats','quote','iconItems','transformation','callout'];
  const supported = contentSupport[data.layout] ?? [];
  for (const field of contentFields) {
    if (data[field] !== undefined && data[field] !== null && !supported.includes(field)) {
      console.warn(`[validate] Slide ${data.index}: "${field}" set but Layout ${data.layout} does not render it — content will be lost`);
    }
  }
});

/**
 * @param {Array} plans
 * @param {{ partial?: boolean }} options - partial=true skips first/last slide rules (for chunks)
 */
export function validatePlans(plans, { partial = false } = {}) {
  if (!Array.isArray(plans) || plans.length === 0)
    throw new Error('[validate] Plans array is empty or not an array');

  const errors = [];
  plans.forEach((plan, i) => {
    const result = SlidePlanSchema.safeParse(plan);
    if (!result.success) errors.push({ slide: i + 1, issues: result.error.issues });
  });

  if (errors.length > 0) {
    console.error('[validate] Errors:\n' + JSON.stringify(errors, null, 2));
    throw new Error(`${errors.length} slide(s) failed schema validation`);
  }

  if (!partial) {
    if (plans[0].layout !== 'A')
      throw new Error(`First slide must be Layout A, got ${plans[0].layout}`);

    const last = plans.at(-1);
    if (last.layout !== 'E' && last.layout !== 'A')
      throw new Error(`Last slide must be Layout E or A, got ${last.layout}`);
  }

  for (let i = 1; i < plans.length; i++) {
    if (plans[i].globalIndex !== plans[i - 1].globalIndex + 1)
      throw new Error(`globalIndex gap between slides ${i} and ${i + 1}`);
  }

  return true;
}
