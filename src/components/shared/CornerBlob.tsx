import React from 'react';
import { GRADIENTS, SPACING } from '../tokens';

export function CornerBlob() {
  const s = SPACING.cornerSize;
  return (
    <div style={{
      position: 'absolute', top: 0, right: 0,
      width: s, height: s,
      background: GRADIENTS.cornerBlob,
      borderRadius: `0 0 0 ${s}px`,
      zIndex: 1,
    }} />
  );
}
