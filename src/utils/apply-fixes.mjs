/**
 * Apply critique fixes to slide plans.
 * Preserves: index, globalIndex, breadcrumb, footer, rightPanel.
 * @param {import('../types/slide.types').SlidePlan[]} plans
 * @param {Array<{slideIndex: number, fixes: Array<{field: string, value?: any, action?: string}>}>} critique
 * @returns {import('../types/slide.types').SlidePlan[]}
 */
export function applyFixes(plans, critique) {
  if (!Array.isArray(critique) || critique.length === 0) return plans;

  const fixed = plans.map(p => ({ ...p }));

  for (const item of critique) {
    const plan = fixed.find(p => p.index === item.slideIndex);
    if (!plan) continue;

    for (const fix of item.fixes ?? []) {
      // Never modify structural fields
      if (['index', 'globalIndex', 'breadcrumb', 'footer', 'rightPanel', 'imagePrompt'].includes(fix.field)) continue;

      if (fix.action === 'delete') {
        delete plan[fix.field];
      } else if (fix.value !== undefined) {
        let value = fix.value;
        // Auto-coerce bullets: flat strings → BulletGroup objects
        if (fix.field === 'bullets' && Array.isArray(value)) {
          value = value.map(item =>
            typeof item === 'string' ? { items: [item] } : item
          );
          // If all items are single-string groups, merge into 2-3 groups
          if (value.length > 4 && value.every(g => g.items?.length === 1)) {
            const flat = value.map(g => g.items[0]);
            const mid = Math.ceil(flat.length / 2);
            value = [{ items: flat.slice(0, mid) }, { items: flat.slice(mid) }];
          }
        }
        // Auto-coerce step numbers to integers
        if (fix.field === 'steps' && Array.isArray(value)) {
          value = value.map(s => ({ ...s, number: typeof s.number === 'string' ? parseInt(s.number, 10) : s.number }));
        }
        // Auto-coerce summary item numbers to strings
        if (fix.field === 'summaryItems' && Array.isArray(value)) {
          value = value.map(s => ({ ...s, number: String(s.number).padStart(2, '0') }));
        }
        // Auto-coerce stats: ensure value/label are strings
        if (fix.field === 'stats' && Array.isArray(value)) {
          value = value.map(s => ({ ...s, value: String(s.value ?? ''), label: String(s.label ?? '') }));
        }
        // Auto-coerce iconItems: truncate body, limit icon length
        if (fix.field === 'iconItems' && Array.isArray(value)) {
          value = value.map(s => ({
            ...s,
            icon: String(s.icon ?? '').slice(0, 4),
            title: String(s.title ?? ''),
            body: String(s.body ?? '').slice(0, 500),
          }));
        }
        // Auto-coerce quote: ensure object format
        if (fix.field === 'quote' && typeof value === 'string') {
          value = { text: value };
        }
        if (fix.field === 'quote' && typeof value === 'object') {
          value = { text: String(value.text ?? ''), ...(value.attribution ? { attribution: String(value.attribution) } : {}) };
        }
        // Auto-coerce transformation: ensure before/after structure
        if (fix.field === 'transformation' && typeof value === 'object') {
          const coerceHalf = (h) => ({
            title: String(h?.title ?? ''),
            items: Array.isArray(h?.items) ? h.items.map(String) : [],
          });
          value = { before: coerceHalf(value.before), after: coerceHalf(value.after) };
        }
        plan[fix.field] = value;
      }
    }
  }

  return fixed;
}
