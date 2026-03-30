import React from 'react';
import { COLORS, TYPOGRAPHY, SPACING, GRADIENTS } from '../tokens';

export function GlassCard({ title, body, style }: { title: string; body: string; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: GRADIENTS.cardSheen,
      border: `1px solid ${COLORS.cardBorder}`,
      borderLeft: `4px solid ${COLORS.primaryPurpleDark}`,
      borderRadius: SPACING.cardRadius,
      padding: SPACING.cardPadding,
      display: 'flex', flexDirection: 'column', gap: 10, ...style,
    }}>
      <span style={{
        fontFamily: TYPOGRAPHY.fontFamily,
        fontSize: TYPOGRAPHY.sizes.cardTitle,
        fontWeight: TYPOGRAPHY.weights.bold,
        color: COLORS.primaryPurpleDark,
        lineHeight: TYPOGRAPHY.lineHeights.tight,
      }}>{title}</span>
      <span style={{
        fontFamily: TYPOGRAPHY.fontFamily,
        fontSize: TYPOGRAPHY.sizes.body,
        fontWeight: TYPOGRAPHY.weights.regular,
        color: COLORS.navyBody,
        lineHeight: TYPOGRAPHY.lineHeights.relaxed,
      }}>{body}</span>
    </div>
  );
}
