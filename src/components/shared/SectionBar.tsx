import React from 'react';
import { COLORS, TYPOGRAPHY, GRADIENTS } from '../tokens';

export function SectionBar({ text }: { text: string }) {
  return (
    <div style={{
      display: 'inline-flex', alignSelf: 'flex-start',
      background: GRADIENTS.sectionBar,
      borderRadius: 6, padding: '6px 18px',
    }}>
      <span style={{
        fontFamily: TYPOGRAPHY.fontFamily,
        fontSize: TYPOGRAPHY.sizes.sectionBar,
        fontWeight: TYPOGRAPHY.weights.bold,
        color: COLORS.white,
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
      }}>{text}</span>
    </div>
  );
}
