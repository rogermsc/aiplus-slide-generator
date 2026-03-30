import React from 'react';
import { Breadcrumb }   from '../shared/Breadcrumb';
import { Logo }          from '../shared/Logo';
import { Footer }        from '../shared/Footer';
import { CornerBlob }    from '../shared/CornerBlob';
import { SectionBar }    from '../shared/SectionBar';
import { AmberCallout }  from '../shared/AmberCallout';
import { COLORS, TYPOGRAPHY, SPACING, CANVAS, GRADIENTS } from '../tokens';
import type { SlidePlan } from '../../types/slide.types';

export function LayoutB({ plan }: { plan: SlidePlan }) {
  const cards = plan.cards ?? [];

  return (
    <div style={{ position:'relative', width: CANVAS.width, height: CANVAS.height, overflow:'hidden', background: GRADIENTS.slideBackground, fontFamily: TYPOGRAPHY.fontFamily }}>
      <CornerBlob />
      <Breadcrumb {...plan.breadcrumb} />
      <div style={{ position:'absolute', top:8, right: SPACING.cornerSize + 12, zIndex:12 }}><Logo variant="sub" /></div>

      <div style={{
        position:'absolute', top: 48, left: SPACING.slideMargin, right: SPACING.slideMargin, bottom: 40,
        display:'flex', flexDirection:'column', gap: SPACING.blockGap,
      }}>
        {/* Header */}
        <div style={{ display:'flex', flexDirection:'column', gap: 6 }}>
          <h2 style={{
            margin:0, fontSize: TYPOGRAPHY.sizes.h2,
            fontWeight: TYPOGRAPHY.weights.bold, color: COLORS.navyBody,
            letterSpacing: '-0.01em',
          }}>{plan.slideTitle}</h2>
          {plan.leadSubheading && (
            <SectionBar text={plan.leadSubheading} />
          )}
        </div>

        {/* Full-width card rows — 2x2 grid */}
        <div style={{
          display:'grid', gridTemplateColumns:'1fr 1fr', gridTemplateRows:'1fr 1fr',
          gap: SPACING.gridGap, flex:1,
        }}>
          {cards.slice(0, 4).map((card, i) => {
            const isOrange = i % 2 === 1;
            const accentColor = isOrange ? COLORS.orange : COLORS.primaryPurpleDeeper;
            return (
              <div key={i} style={{
                background: COLORS.cardGlass,
                border: `1px solid ${COLORS.cardBorder}`,
                borderTop: `3px solid ${accentColor}`,
                borderRadius: SPACING.cardRadius,
                padding: SPACING.cardPadding,
                display:'flex', flexDirection:'column', gap: 10,
                position:'relative',
              }}>
                {/* Number badge */}
                <div style={{
                  display:'inline-flex', alignSelf:'flex-start',
                  background: accentColor, borderRadius: 5,
                  padding: '2px 10px',
                }}>
                  <span style={{ fontSize: 11, fontWeight: TYPOGRAPHY.weights.bold, color: COLORS.white, letterSpacing:'0.08em' }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </div>

                <span style={{
                  fontFamily: TYPOGRAPHY.fontFamily, fontSize: TYPOGRAPHY.sizes.cardTitle,
                  fontWeight: TYPOGRAPHY.weights.bold, color: COLORS.primaryPurpleDeeper,
                  lineHeight: TYPOGRAPHY.lineHeights.tight,
                }}>{card.title}</span>

                <span style={{
                  fontFamily: TYPOGRAPHY.fontFamily, fontSize: TYPOGRAPHY.sizes.body,
                  fontWeight: TYPOGRAPHY.weights.regular, color: COLORS.navyBody,
                  lineHeight: TYPOGRAPHY.lineHeights.relaxed, flex:1,
                }}>{card.body}</span>
              </div>
            );
          })}
        </div>

        {plan.callout && <AmberCallout text={plan.callout} />}
      </div>
      <Footer {...plan.footer} />
    </div>
  );
}
