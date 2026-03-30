import { z } from 'zod';

const CardItemSchema    = z.object({ title: z.string().min(1), body: z.string().min(1) });
const StepItemSchema    = z.object({ number: z.number().int().positive(), title: z.string(), body: z.string() });
const SummaryItemSchema = z.object({ number: z.string().regex(/^\d{2}$/), title: z.string() });

const SlidePlanSchema = z.object({
  index:           z.number().int().positive(),
  globalIndex:     z.number().int().positive(),
  layout:          z.enum(['A', 'B', 'C', 'D', 'E']),
  slideTitle:      z.string().min(1).max(80),
  leadSubheading:  z.string().max(120).optional(),
  body:            z.string().max(500).optional(),
  cards:           z.array(CardItemSchema).optional(),
  steps:           z.array(StepItemSchema).optional(),
  summaryItems:    z.array(SummaryItemSchema).optional(),
  tableData:       z.object({ headers: z.array(z.string()), rows: z.array(z.array(z.string())) }).optional(),
  checklistItems:  z.array(z.string()).optional(),
  callout:         z.string().max(200).optional(),
  speakerNotes:    z.string().max(600).optional(),
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
  if (data.rightPanel.type === 'photo' && !data.imagePrompt)
    ctx.addIssue({ code: 'custom', path: ['imagePrompt'],  message: 'Photo panel slides must include imagePrompt' });
  if (data.footer.pageNumber !== data.globalIndex)
    ctx.addIssue({ code: 'custom', path: ['footer'],       message: `pageNumber (${data.footer.pageNumber}) must equal globalIndex (${data.globalIndex})` });
});

export function validatePlans(plans) {
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

  if (plans[0].layout !== 'A')
    throw new Error(`First slide must be Layout A, got ${plans[0].layout}`);

  const last = plans.at(-1);
  if (last.layout !== 'E' && last.layout !== 'A')
    throw new Error(`Last slide must be Layout E or A, got ${last.layout}`);

  for (let i = 1; i < plans.length; i++) {
    if (plans[i].globalIndex !== plans[i - 1].globalIndex + 1)
      throw new Error(`globalIndex gap between slides ${i} and ${i + 1}`);
  }

  return true;
}
