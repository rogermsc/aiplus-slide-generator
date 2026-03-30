import React from 'react';
import { Breadcrumb } from '../shared/Breadcrumb';
import { Logo }        from '../shared/Logo';
import { Footer }      from '../shared/Footer';
import { AmberCallout } from '../shared/AmberCallout';
import { COLORS, TYPOGRAPHY, SPACING, GRADIENTS } from '../tokens';
import type { SlidePlan } from '../../types/slide.types';

export function LayoutC({ plan }: { plan: SlidePlan }) {
  const [cardA, cardB] = plan.cards ?? [];
  return (
    <div style={{ position:'relative', width:1440, height:810, overflow:'hidden', background: GRADIENTS.slideBackground, fontFamily: TYPOGRAPHY.fontFamily }}>
      <Breadcrumb {...plan.breadcrumb} />
      <div style={{ position:'absolute', top:6, right: SPACING.slideMargin, zIndex:12 }}><Logo variant="sub" /></div>
      <div style={{ position:'absolute', top:52, left: SPACING.slideMargin, right: SPACING.slideMargin, bottom:36, display:'flex', flexDirection:'column', gap: SPACING.blockGap }}>
        <h2 style={{ margin:0, fontSize: TYPOGRAPHY.sizes.h2, fontWeight: TYPOGRAPHY.weights.bold, color: COLORS.navyBody }}>{plan.slideTitle}</h2>
        {plan.leadSubheading && <p style={{ margin:0, fontSize: TYPOGRAPHY.sizes.lead, fontWeight: TYPOGRAPHY.weights.bold, color: COLORS.primaryPurpleDark }}>{plan.leadSubheading}</p>}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap: SPACING.gridGap, flex:1 }}>
          {/* Contrast/warning card */}
          <div style={{ background: 'rgba(255,255,255,0.72)', border: `2px solid ${COLORS.orange}`, borderRadius: SPACING.cardRadius, padding: SPACING.cardPadding, display:'flex', flexDirection:'column', gap:10 }}>
            <span style={{ fontSize: TYPOGRAPHY.sizes.h2, fontWeight: TYPOGRAPHY.weights.bold, color: COLORS.orange }}>{cardA?.title}</span>
            <p style={{ margin:0, fontSize: TYPOGRAPHY.sizes.body, color: COLORS.navyBody, lineHeight: TYPOGRAPHY.lineHeights.body }}>{cardA?.body}</p>
          </div>
          {/* Preferred/safe card */}
          <div style={{ background: 'rgba(255,255,255,0.72)', border: `2px solid ${COLORS.primaryPurpleDark}`, borderRadius: SPACING.cardRadius, padding: SPACING.cardPadding, display:'flex', flexDirection:'column', gap:10 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
              <span style={{ fontSize: TYPOGRAPHY.sizes.h2, fontWeight: TYPOGRAPHY.weights.bold, color: COLORS.primaryPurpleDark }}>{cardB?.title}</span>
              <Logo variant="sub" />
            </div>
            <p style={{ margin:0, fontSize: TYPOGRAPHY.sizes.body, color: COLORS.navyBody, lineHeight: TYPOGRAPHY.lineHeights.body }}>{cardB?.body}</p>
          </div>
        </div>
        {plan.body    && <p style={{ margin:0, fontSize: TYPOGRAPHY.sizes.body, color: COLORS.navyBody, lineHeight: TYPOGRAPHY.lineHeights.body }}>{plan.body}</p>}
        {plan.callout && <AmberCallout text={plan.callout} />}
      </div>
      <Footer {...plan.footer} />
    </div>
  );
}
