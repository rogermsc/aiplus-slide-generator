import React from 'react';
import { COLORS, TYPOGRAPHY, SPACING } from '../tokens';

export function Footer({ domain, pageNumber }: { domain: string; pageNumber: number }) {
  return (
    <div style={{
      position: 'absolute', bottom: 14, right: SPACING.slideMargin,
      display: 'flex', alignItems: 'center', gap: 18,
      fontFamily: TYPOGRAPHY.fontFamily, fontSize: TYPOGRAPHY.sizes.footer,
      fontWeight: TYPOGRAPHY.weights.regular, color: COLORS.primaryPurpleDark,
      zIndex: 10,
    }}>
      <span>{domain}</span>
      <span style={{ fontWeight: TYPOGRAPHY.weights.medium }}>{pageNumber}</span>
    </div>
  );
}
