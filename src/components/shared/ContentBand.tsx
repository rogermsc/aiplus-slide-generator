import React from 'react';
import { COLORS, SPACING } from '../tokens';

export function ContentBand({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: COLORS.bandBg,
      border: `1px solid ${COLORS.bandBorder}`,
      borderRadius: SPACING.bandRadius,
      padding: SPACING.bandPadding,
      width: '100%',
      ...style,
    }}>
      {children}
    </div>
  );
}
