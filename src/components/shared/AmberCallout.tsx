import React from 'react';
import { COLORS, TYPOGRAPHY, SPACING } from '../tokens';

export function AmberCallout({ text }: { text: string }) {
  return (
    <div style={{
      background: COLORS.amber, borderRadius: SPACING.calloutRadius,
      padding: '12px 16px', fontFamily: TYPOGRAPHY.fontFamily,
      fontSize: TYPOGRAPHY.sizes.callout, fontWeight: TYPOGRAPHY.weights.bold,
      color: COLORS.navyBody, lineHeight: TYPOGRAPHY.lineHeights.body,
    }}>
      {text}
    </div>
  );
}
