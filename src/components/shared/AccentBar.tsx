import React from 'react';
import { COLORS, SPACING } from '../tokens';

export function AccentBar({ style }: { style?: React.CSSProperties }) {
  return (
    <div style={{
      width: SPACING.accentBarW, height: SPACING.accentBarH,
      background: COLORS.primaryPurpleDark, borderRadius: 2,
      flexShrink: 0, ...style,
    }} />
  );
}
