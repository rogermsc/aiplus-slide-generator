import React from 'react';
import { COLORS, TYPOGRAPHY } from '../tokens';

export function CheckListBox({ items }: { items: string[] }) {
  return (
    <div style={{ border: `1.5px solid ${COLORS.primaryPurpleDark}`, background: COLORS.checklistBg, borderRadius: 10, padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
      {items.map((item, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <div style={{ width: 16, height: 16, borderRadius: 3, border: `1.5px solid ${COLORS.primaryPurpleDark}`, flexShrink: 0, marginTop: 1 }} />
          <span style={{ fontFamily: TYPOGRAPHY.fontFamily, fontSize: TYPOGRAPHY.sizes.body, fontWeight: TYPOGRAPHY.weights.regular, color: COLORS.navyBody, lineHeight: TYPOGRAPHY.lineHeights.body }}>{item}</span>
        </div>
      ))}
    </div>
  );
}
