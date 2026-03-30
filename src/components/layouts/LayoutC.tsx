import React from 'react';
import { Breadcrumb }   from '../shared/Breadcrumb';
import { Logo }          from '../shared/Logo';
import { Footer }        from '../shared/Footer';
import { CornerBlob }    from '../shared/CornerBlob';
import { AmberCallout }  from '../shared/AmberCallout';
import { COLORS, TYPOGRAPHY, SPACING, CANVAS, GRADIENTS } from '../tokens';
import type { SlidePlan } from '../../types/slide.types';

export function LayoutC({ plan }: { plan: SlidePlan }) {
  const [cardA, cardB] = plan.cards ?? [];

  return (
    <div style={{ position:'relative', width: CANVAS.width, height: CANVAS.height, overflow:'hidden', background: GRADIENTS.slideBackground, fontFamily: TYPOGRAPHY.fontFamily }}>
      <CornerBlob />
      <Breadcrumb {...plan.breadcrumb} />
      <div style={{ position:'absolute', top:8, right: SPACING.cornerSize + 12, zIndex:12 }}><Logo variant="sub" /></div>

      <div style={{
        position:'absolute', top: 48, left: SPACING.slideMargin, right: SPACING.slideMargin, bottom: 40,
        display:'flex', flexDirection:'column', gap: SPACING.blockGap,
      }}>
        <h2 style={{
          margin:0, fontSize: TYPOGRAPHY.sizes.h2,
          fontWeight: TYPOGRAPHY.weights.bold, color: COLORS.navyBody,
          letterSpacing: '-0.01em',
        }}>{plan.slideTitle}</h2>
        {plan.leadSubheading && (
          <p style={{ margin:0, fontSize: TYPOGRAPHY.sizes.lead, fontWeight: TYPOGRAPHY.weights.semibold, color: COLORS.primaryPurpleDark }}>{plan.leadSubheading}</p>
        )}

        {/* Full-width two-column comparison */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap: SPACING.gridGap + 4, flex:1 }}>
          {/* Column A header + card */}
          <div style={{ display:'flex', flexDirection:'column', gap: 0 }}>
            <div style={{
              background: COLORS.orange, borderRadius: '8px 8px 0 0',
              padding: '8px 18px', display:'flex', alignItems:'center', gap: 8,
            }}>
              <span style={{ fontSize: TYPOGRAPHY.sizes.sectionBar, fontWeight: TYPOGRAPHY.weights.bold, color: COLORS.white, textTransform:'uppercase', letterSpacing:'0.08em' }}>{cardA?.title}</span>
            </div>
            <div style={{
              background: COLORS.cardGlass, border: `1px solid ${COLORS.orange}33`,
              borderTop:'none', borderRadius: '0 0 8px 8px',
              padding: SPACING.cardPadding, flex:1,
              display:'flex', flexDirection:'column', gap: 10,
            }}>
              <p style={{ margin:0, fontSize: TYPOGRAPHY.sizes.body, color: COLORS.navyBody, lineHeight: TYPOGRAPHY.lineHeights.relaxed }}>{cardA?.body}</p>
              {cardA?.bullets && cardA.bullets.length > 0 && (
                <div style={{ display:'flex', flexDirection:'column', gap: 6, marginTop: 4 }}>
                  {cardA.bullets.map((item, j) => (
                    <div key={j} style={{ display:'flex', alignItems:'flex-start', gap: 8 }}>
                      <span style={{ color: COLORS.orange, fontSize: 12, marginTop: 3, flexShrink: 0 }}>•</span>
                      <span style={{ fontSize: TYPOGRAPHY.sizes.body, color: COLORS.navyBody, lineHeight: TYPOGRAPHY.lineHeights.body }}>{item}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Column B header + card */}
          <div style={{ display:'flex', flexDirection:'column', gap: 0 }}>
            <div style={{
              background: COLORS.primaryPurpleDeeper, borderRadius: '8px 8px 0 0',
              padding: '8px 18px', display:'flex', alignItems:'center', justifyContent:'space-between',
            }}>
              <span style={{ fontSize: TYPOGRAPHY.sizes.sectionBar, fontWeight: TYPOGRAPHY.weights.bold, color: COLORS.white, textTransform:'uppercase', letterSpacing:'0.08em' }}>{cardB?.title}</span>
              <Logo variant="sub" />
            </div>
            <div style={{
              background: COLORS.cardGlass, border: `1px solid ${COLORS.primaryPurpleDeeper}22`,
              borderTop:'none', borderRadius: '0 0 8px 8px',
              padding: SPACING.cardPadding, flex:1,
              display:'flex', flexDirection:'column', gap: 10,
            }}>
              <p style={{ margin:0, fontSize: TYPOGRAPHY.sizes.body, color: COLORS.navyBody, lineHeight: TYPOGRAPHY.lineHeights.relaxed }}>{cardB?.body}</p>
              {cardB?.bullets && cardB.bullets.length > 0 && (
                <div style={{ display:'flex', flexDirection:'column', gap: 6, marginTop: 4 }}>
                  {cardB.bullets.map((item, j) => (
                    <div key={j} style={{ display:'flex', alignItems:'flex-start', gap: 8 }}>
                      <span style={{ color: COLORS.primaryPurpleDeeper, fontSize: 12, marginTop: 3, flexShrink: 0 }}>•</span>
                      <span style={{ fontSize: TYPOGRAPHY.sizes.body, color: COLORS.navyBody, lineHeight: TYPOGRAPHY.lineHeights.body }}>{item}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {plan.body && (
          <p style={{ margin:0, fontSize: TYPOGRAPHY.sizes.body, color: COLORS.navyBody, lineHeight: TYPOGRAPHY.lineHeights.body }}>{plan.body}</p>
        )}
        {plan.callout && <AmberCallout text={plan.callout} />}
      </div>
      <Footer {...plan.footer} />
    </div>
  );
}
