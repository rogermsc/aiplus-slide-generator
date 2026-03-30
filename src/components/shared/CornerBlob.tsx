import React from 'react';
import { GRADIENTS, SPACING } from '../tokens';

export function CornerBlob() {
  const s = SPACING.cornerSize;
  return (
    <div style={{
      position: 'absolute', top: 0, right: 0,
      width: s, height: s, overflow: 'hidden', zIndex: 1,
    }}>
      <div style={{
        width: s * 1.4, height: s * 1.4,
        background: GRADIENTS.cornerBlob,
        borderRadius: '0 0 0 50%',
        position: 'absolute', top: -s * 0.2, right: -s * 0.2,
      }} />
    </div>
  );
}
