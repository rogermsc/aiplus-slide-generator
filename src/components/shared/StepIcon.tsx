import React from 'react';
import { COLORS, TYPOGRAPHY, SPACING } from '../tokens';

export function StepIcon({ number }: { number: number }) {
  const bg = number % 2 !== 0 ? COLORS.orange : COLORS.primaryPurpleDark;
  return (
    <div style={{
      width: SPACING.stepIconSize, height: SPACING.stepIconSize,
      borderRadius: SPACING.stepIconRadius, background: bg, flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <span style={{ fontFamily: TYPOGRAPHY.fontFamily, fontSize: 12, fontWeight: TYPOGRAPHY.weights.bold, color: COLORS.white }}>{number}</span>
    </div>
  );
}
