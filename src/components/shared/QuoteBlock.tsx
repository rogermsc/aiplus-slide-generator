import React from 'react';
import { COLORS, TYPOGRAPHY, SPACING } from '../tokens';

export function QuoteBlock({ text, attribution }: { text: string; attribution?: string }) {
  return (
    <div style={{
      background: COLORS.bandBg,
      borderLeft: `4px solid ${COLORS.primaryPurpleDeeper}`,
      borderRadius: SPACING.bandRadius,
      padding: '20px 28px',
      position: 'relative',
    }}>
      {/* Decorative quote mark */}
      <span style={{
        position: 'absolute', top: 8, left: 16,
        fontSize: 48, lineHeight: 1, color: COLORS.primaryPurpleDeeper,
        opacity: 0.12, fontFamily: 'Georgia, serif',
      }}>"</span>
      <p style={{
        margin: 0, paddingLeft: 20,
        fontFamily: TYPOGRAPHY.fontFamily,
        fontSize: TYPOGRAPHY.sizes.quoteText,
        fontWeight: TYPOGRAPHY.weights.medium,
        fontStyle: 'italic',
        color: COLORS.navyBody,
        lineHeight: TYPOGRAPHY.lineHeights.relaxed,
      }}>{text}</p>
      {attribution && (
        <p style={{
          margin: '10px 0 0', paddingLeft: 20, textAlign: 'right',
          fontFamily: TYPOGRAPHY.fontFamily,
          fontSize: TYPOGRAPHY.sizes.quoteAttrib,
          fontWeight: TYPOGRAPHY.weights.medium,
          color: COLORS.purpleSubtext,
        }}>— {attribution}</p>
      )}
    </div>
  );
}
