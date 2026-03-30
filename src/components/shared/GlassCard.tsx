import React from 'react';
import { COLORS, TYPOGRAPHY, SPACING } from '../tokens';

export function GlassCard({ title, body, style }: { title: string; body: string; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: COLORS.cardGlass, border: `1px solid ${COLORS.cardBorder}`,
      borderRadius: SPACING.cardRadius, padding: SPACING.cardPadding,
      display: 'flex', flexDirection: 'column', gap: 8, ...style,
    }}>
      <span style={{ fontFamily: TYPOGRAPHY.fontFamily, fontSize: TYPOGRAPHY.sizes.cardTitle, fontWeight: TYPOGRAPHY.weights.bold, color: COLORS.primaryPurpleDark, lineHeight: TYPOGRAPHY.lineHeights.tight }}>{title}</span>
      <span style={{ fontFamily: TYPOGRAPHY.fontFamily, fontSize: TYPOGRAPHY.sizes.body, fontWeight: TYPOGRAPHY.weights.regular, color: COLORS.navyBody, lineHeight: TYPOGRAPHY.lineHeights.body }}>{body}</span>
    </div>
  );
}
