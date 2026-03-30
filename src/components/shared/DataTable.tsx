import React from 'react';
import { COLORS, TYPOGRAPHY } from '../tokens';
import type { TableData } from '../../types/slide.types';

export function DataTable({ data }: { data: TableData }) {
  return (
    <div style={{ border: `1px solid ${COLORS.tableBorder}`, borderRadius: 8, overflow: 'hidden', width: '100%' }}>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${data.headers.length}, 1fr)`, background: COLORS.tableHeaderBg }}>
        {data.headers.map((h, i) => (
          <div key={i} style={{ padding: '8px 12px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: TYPOGRAPHY.sizes.tableKey, fontWeight: TYPOGRAPHY.weights.bold, color: COLORS.navyBody, borderRight: i < data.headers.length - 1 ? `1px solid ${COLORS.tableBorder}` : 'none' }}>{h}</div>
        ))}
      </div>
      {data.rows.map((row, ri) => (
        <div key={ri} style={{ display: 'grid', gridTemplateColumns: `repeat(${data.headers.length}, 1fr)`, borderTop: `1px solid ${COLORS.tableRowDivider}` }}>
          {row.map((cell, ci) => (
            <div key={ci} style={{ padding: '8px 12px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: TYPOGRAPHY.sizes.body, fontWeight: ci === 0 ? TYPOGRAPHY.weights.bold : TYPOGRAPHY.weights.regular, color: ci === 0 ? COLORS.primaryPurpleDark : COLORS.navyBody, borderRight: ci < row.length - 1 ? `1px solid ${COLORS.tableRowDivider}` : 'none' }}>{cell}</div>
          ))}
        </div>
      ))}
    </div>
  );
}
