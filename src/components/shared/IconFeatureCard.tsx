import React from 'react';
import { COLORS, TYPOGRAPHY, SPACING } from '../tokens';

export function IconFeatureCard({ icon, title, body, accentColor }: {
  icon: string; title: string; body: string; accentColor?: string;
}) {
  const color = accentColor ?? COLORS.primaryPurpleDeeper;
  return (
    <div style={{
      background: COLORS.cardGlass,
      border: `1px solid ${COLORS.cardBorder}`,
      borderTop: `3px solid ${color}`,
      borderRadius: SPACING.cardRadius,
      padding: SPACING.cardPadding,
      display: 'flex', flexDirection: 'column', gap: 8,
      flex: 1,
    }}>
      <span style={{ fontSize: TYPOGRAPHY.sizes.iconEmoji, lineHeight: 1 }}>{icon}</span>
      <span style={{
        fontFamily: TYPOGRAPHY.fontFamily,
        fontSize: TYPOGRAPHY.sizes.iconTitle,
        fontWeight: TYPOGRAPHY.weights.bold,
        color, lineHeight: TYPOGRAPHY.lineHeights.tight,
      }}>{title}</span>
      <span style={{
        fontFamily: TYPOGRAPHY.fontFamily,
        fontSize: TYPOGRAPHY.sizes.iconBody,
        fontWeight: TYPOGRAPHY.weights.regular,
        color: COLORS.navyBody,
        lineHeight: TYPOGRAPHY.lineHeights.relaxed,
      }}>{body}</span>
    </div>
  );
}
