import React from 'react';
import { COLORS, TYPOGRAPHY, SPACING } from '../tokens';

export function Breadcrumb({ course, session, module }: { course: string; session: string; module: string }) {
  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, height: 36,
      display: 'flex', alignItems: 'center',
      paddingLeft: SPACING.slideMargin, paddingRight: SPACING.slideMargin,
      background: 'rgba(255,255,255,0.85)',
      zIndex: 11,
    }}>
      <span style={{
        fontFamily: TYPOGRAPHY.fontFamily, fontSize: TYPOGRAPHY.sizes.breadcrumb,
        fontWeight: TYPOGRAPHY.weights.medium, color: COLORS.primaryPurple,
        textTransform: 'uppercase', letterSpacing: '0.08em',
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
      }}>
        {`${course} ——— ${session} ——— ${module}`}
      </span>
    </div>
  );
}
