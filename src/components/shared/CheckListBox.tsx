import React from 'react';
import { COLORS, TYPOGRAPHY, SPACING, GRADIENTS } from '../tokens';

export function CheckListBox({ items }: { items: string[] }) {
  return (
    <div style={{
      border: `1.5px solid ${COLORS.primaryPurpleDark}`,
      background: GRADIENTS.cardSheen,
      borderRadius: SPACING.cardRadius,
      padding: '20px 24px',
      display: 'flex', flexDirection: 'column', gap: 14,
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Header label */}
      <div style={{
        display: 'inline-flex', alignSelf: 'flex-start',
        background: 'rgba(83,74,183,0.08)', borderRadius: 6,
        padding: '3px 10px', marginBottom: 2,
      }}>
        <span style={{
          fontSize: 10, fontWeight: TYPOGRAPHY.weights.bold,
          color: COLORS.primaryPurpleDark, textTransform: 'uppercase',
          letterSpacing: '0.12em',
        }}>Self-check</span>
      </div>

      {items.map((item, i) => (
        <div key={i} style={{
          display: 'flex', alignItems: 'flex-start', gap: 14,
          padding: '10px 14px',
          background: 'rgba(255,255,255,0.5)',
          borderRadius: 8,
          border: `1px solid ${COLORS.cardBorder}`,
        }}>
          <div style={{
            width: 22, height: 22, borderRadius: 4,
            border: `2px solid ${COLORS.primaryPurpleDark}`,
            flexShrink: 0, marginTop: 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontSize: 10, fontWeight: TYPOGRAPHY.weights.bold, color: COLORS.primaryPurpleDark }}>{i + 1}</span>
          </div>
          <span style={{
            fontFamily: TYPOGRAPHY.fontFamily,
            fontSize: TYPOGRAPHY.sizes.checkItem,
            fontWeight: TYPOGRAPHY.weights.medium,
            color: COLORS.navyBody,
            lineHeight: TYPOGRAPHY.lineHeights.body,
          }}>{item}</span>
        </div>
      ))}
    </div>
  );
}
