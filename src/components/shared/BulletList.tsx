import React from 'react';
import { COLORS, TYPOGRAPHY } from '../tokens';

export function BulletList({ title, items }: { title?: string; items: string[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {title && (
        <span style={{
          fontFamily: TYPOGRAPHY.fontFamily,
          fontSize: TYPOGRAPHY.sizes.body,
          fontWeight: TYPOGRAPHY.weights.bold,
          color: COLORS.primaryPurpleDeeper,
          marginBottom: 2,
        }}>{title}</span>
      )}
      {items.map((item, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <div style={{
            width: 6, height: 6, borderRadius: '50%',
            background: COLORS.primaryPurpleDeeper,
            flexShrink: 0, marginTop: 7,
          }} />
          <span style={{
            fontFamily: TYPOGRAPHY.fontFamily,
            fontSize: TYPOGRAPHY.sizes.bullet,
            fontWeight: TYPOGRAPHY.weights.regular,
            color: COLORS.navyBody,
            lineHeight: TYPOGRAPHY.lineHeights.body,
          }}>{item}</span>
        </div>
      ))}
    </div>
  );
}
