import React from 'react';
import { COLORS, TYPOGRAPHY, SPACING, GRADIENTS } from '../tokens';
import { BulletList } from './BulletList';

export function TransformationBlock({ before, after }: {
  before: { title: string; items: string[] };
  after:  { title: string; items: string[] };
}) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 12, alignItems: 'stretch' }}>
      {/* Before column */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        <div style={{
          background: COLORS.orange, borderRadius: '8px 8px 0 0',
          padding: '8px 18px',
        }}>
          <span style={{
            fontSize: TYPOGRAPHY.sizes.sectionBar, fontWeight: TYPOGRAPHY.weights.bold,
            color: COLORS.white, textTransform: 'uppercase', letterSpacing: '0.08em',
          }}>{before.title}</span>
        </div>
        <div style={{
          background: COLORS.cardGlass, border: `1px solid ${COLORS.orange}33`,
          borderTop: 'none', borderRadius: '0 0 8px 8px',
          padding: SPACING.cardPadding, flex: 1,
        }}>
          <BulletList items={before.items} />
        </div>
      </div>

      {/* Arrow */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px' }}>
        <span style={{ fontSize: 28, color: COLORS.primaryPurpleDeeper, fontWeight: TYPOGRAPHY.weights.bold }}>→</span>
      </div>

      {/* After column */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        <div style={{
          background: COLORS.primaryPurpleDeeper, borderRadius: '8px 8px 0 0',
          padding: '8px 18px',
        }}>
          <span style={{
            fontSize: TYPOGRAPHY.sizes.sectionBar, fontWeight: TYPOGRAPHY.weights.bold,
            color: COLORS.white, textTransform: 'uppercase', letterSpacing: '0.08em',
          }}>{after.title}</span>
        </div>
        <div style={{
          background: COLORS.cardGlass, border: `1px solid ${COLORS.primaryPurpleDeeper}22`,
          borderTop: 'none', borderRadius: '0 0 8px 8px',
          padding: SPACING.cardPadding, flex: 1,
        }}>
          <BulletList items={after.items} />
        </div>
      </div>
    </div>
  );
}
