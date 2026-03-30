import React from 'react';
import { Breadcrumb }   from '../shared/Breadcrumb';
import { Logo }          from '../shared/Logo';
import { Footer }        from '../shared/Footer';
import { CornerBlob }    from '../shared/CornerBlob';
import { SectionBar }    from '../shared/SectionBar';
import { COLORS, TYPOGRAPHY, SPACING, CANVAS, GRADIENTS } from '../tokens';
import type { SlidePlan } from '../../types/slide.types';

export function LayoutE({ plan }: { plan: SlidePlan }) {
  const items = plan.summaryItems ?? [];

  return (
    <div style={{ position:'relative', width: CANVAS.width, height: CANVAS.height, overflow:'hidden', background: GRADIENTS.slideBackground, fontFamily: TYPOGRAPHY.fontFamily }}>
      <CornerBlob />
      <Breadcrumb {...plan.breadcrumb} />
      <div style={{ position:'absolute', top:8, right: SPACING.cornerSize + 12, zIndex:12 }}><Logo variant="sub" /></div>

      <div style={{
        position:'absolute', top: 48, left: SPACING.slideMargin, right: SPACING.slideMargin, bottom: 40,
        display:'flex', flexDirection:'column', gap: SPACING.blockGap + 2,
      }}>
        {/* Header */}
        <div style={{ display:'flex', flexDirection:'column', gap: 6 }}>
          <h2 style={{
            margin:0, fontSize: TYPOGRAPHY.sizes.h2,
            fontWeight: TYPOGRAPHY.weights.bold, color: COLORS.navyBody,
            letterSpacing: '-0.01em',
          }}>{plan.slideTitle}</h2>
          {plan.leadSubheading && <SectionBar text={plan.leadSubheading} />}
        </div>

        {/* Summary cards — 2x2 grid filling space */}
        <div style={{
          display:'grid', gridTemplateColumns:'1fr 1fr', gridTemplateRows:'1fr 1fr',
          gap: SPACING.gridGap, flex:1,
        }}>
          {items.slice(0, 4).map((item, i) => {
            const isOrange = i % 2 === 1;
            const accentColor = isOrange ? COLORS.orange : COLORS.primaryPurpleDeeper;
            return (
              <div key={item.number} style={{
                background: COLORS.cardGlass,
                border: `1px solid ${COLORS.cardBorder}`,
                borderTop: `3px solid ${accentColor}`,
                borderRadius: SPACING.cardRadius,
                padding: SPACING.cardPadding,
                display:'flex', flexDirection:'column', gap: 8,
                position:'relative', overflow:'hidden',
              }}>
                {/* Watermark number */}
                <span style={{
                  position:'absolute', top: -6, right: 10,
                  fontSize: 68, fontWeight: TYPOGRAPHY.weights.black,
                  color: isOrange ? 'rgba(232,130,58,0.06)' : 'rgba(82,78,214,0.06)',
                  lineHeight: 1, userSelect:'none',
                }}>{item.number}</span>

                <span style={{
                  fontSize: TYPOGRAPHY.sizes.summaryNum,
                  fontWeight: TYPOGRAPHY.weights.bold, color: accentColor,
                  lineHeight: 1,
                }}>{item.number}</span>

                <span style={{
                  fontSize: TYPOGRAPHY.sizes.cardTitle,
                  fontWeight: TYPOGRAPHY.weights.bold, color: COLORS.navyBody,
                  lineHeight: TYPOGRAPHY.lineHeights.tight,
                }}>{item.title}</span>

                {item.body && (
                  <p style={{
                    margin:0, fontSize: TYPOGRAPHY.sizes.body,
                    color: COLORS.purpleSubtext, lineHeight: TYPOGRAPHY.lineHeights.body,
                  }}>{item.body}</p>
                )}
              </div>
            );
          })}
        </div>

        {/* Closing tagline */}
        {plan.body && (
          <div style={{
            background: COLORS.bandBg, borderRadius: SPACING.bandRadius,
            padding: '12px 20px', borderLeft: `4px solid ${COLORS.primaryPurpleDeeper}`,
          }}>
            <p style={{
              margin:0, fontSize: TYPOGRAPHY.sizes.body,
              fontStyle:'italic', color: COLORS.purpleSubtext,
              lineHeight: TYPOGRAPHY.lineHeights.body,
            }}>{plan.body}</p>
          </div>
        )}
      </div>
      <Footer {...plan.footer} />
    </div>
  );
}
