import React from 'react';
import { COLORS, TYPOGRAPHY, SPACING, GRADIENTS } from '../tokens';

export function StatCard({ value, label, context, accentColor }: {
  value: string; label: string; context?: string; accentColor?: string;
}) {
  const color = accentColor ?? COLORS.primaryPurpleDeeper;
  return (
    <div style={{
      background: COLORS.cardGlass,
      border: `1px solid ${COLORS.cardBorder}`,
      borderTop: `3px solid ${color}`,
      borderRadius: SPACING.cardRadius,
      padding: SPACING.cardPadding,
      display: 'flex', flexDirection: 'column', gap: 4,
      flex: 1,
    }}>
      <span style={{
        fontFamily: TYPOGRAPHY.fontFamily,
        fontSize: TYPOGRAPHY.sizes.statValue,
        fontWeight: TYPOGRAPHY.weights.black,
        color, lineHeight: 1.1,
      }}>{value}</span>
      <span style={{
        fontFamily: TYPOGRAPHY.fontFamily,
        fontSize: TYPOGRAPHY.sizes.statLabel,
        fontWeight: TYPOGRAPHY.weights.bold,
        color: COLORS.navyBody,
        textTransform: 'uppercase', letterSpacing: '0.06em',
      }}>{label}</span>
      {context && (
        <span style={{
          fontFamily: TYPOGRAPHY.fontFamily,
          fontSize: 13, fontWeight: TYPOGRAPHY.weights.regular,
          color: COLORS.purpleSubtext,
          lineHeight: TYPOGRAPHY.lineHeights.body, marginTop: 2,
        }}>{context}</span>
      )}
    </div>
  );
}
