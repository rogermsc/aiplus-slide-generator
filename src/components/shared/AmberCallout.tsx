import React from 'react';
import { COLORS, TYPOGRAPHY, SPACING } from '../tokens';

export function AmberCallout({ text }: { text: string }) {
  return (
    <div style={{
      background: COLORS.amber, borderRadius: SPACING.calloutRadius,
      padding: '14px 20px', fontFamily: TYPOGRAPHY.fontFamily,
      fontSize: TYPOGRAPHY.sizes.callout, fontWeight: TYPOGRAPHY.weights.bold,
      color: COLORS.navyBody, lineHeight: TYPOGRAPHY.lineHeights.body,
      display: 'flex', alignItems: 'center', gap: 12,
    }}>
      <span style={{ fontSize: 18, flexShrink: 0 }}>!</span>
      <span>{text}</span>
    </div>
  );
}
