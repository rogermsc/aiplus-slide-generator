import React from 'react';
import { COLORS, TYPOGRAPHY, SPACING, GRADIENTS } from '../tokens';

interface LogoProps { variant?: 'full' | 'sub'; style?: React.CSSProperties; }

export function Logo({ variant = 'sub', style }: LogoProps) {
  const fs = variant === 'full' ? 16 : 13;
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', zIndex: 12,
      background: COLORS.primaryPurpleDark, borderRadius: SPACING.logoRadius,
      padding: variant === 'full' ? '6px 14px' : '5px 10px', gap: 1, ...style,
    }}>
      <span style={{ color: COLORS.white, fontWeight: TYPOGRAPHY.weights.black, fontSize: fs }}>AI</span>
      <span style={{
        fontWeight: TYPOGRAPHY.weights.black, fontSize: fs,
        background: GRADIENTS.logo,
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
      }}>+</span>
      {variant === 'full' && (
        <span style={{ color: COLORS.white, fontWeight: TYPOGRAPHY.weights.black, fontSize: fs }}>PRO</span>
      )}
    </div>
  );
}
