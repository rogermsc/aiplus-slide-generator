import React from 'react';
import { Breadcrumb } from '../shared/Breadcrumb';
import { Logo }        from '../shared/Logo';
import { Footer }      from '../shared/Footer';
import { COLORS, TYPOGRAPHY, SPACING, GRADIENTS } from '../tokens';
import type { SlidePlan } from '../../types/slide.types';

export function LayoutE({ plan }: { plan: SlidePlan }) {
  const items = plan.summaryItems ?? [];
  return (
    <div style={{ position:'relative', width:1440, height:810, overflow:'hidden', background: GRADIENTS.slideBackground, fontFamily: TYPOGRAPHY.fontFamily }}>
      <Breadcrumb {...plan.breadcrumb} />
      <div style={{ position:'absolute', top:6, right: SPACING.slideMargin, zIndex:12 }}><Logo variant="sub" /></div>
      <div style={{ position:'absolute', top:52, left: SPACING.slideMargin, right: SPACING.slideMargin, bottom:36, display:'flex', flexDirection:'column', justifyContent:'center', gap: SPACING.blockGap }}>
        <h2 style={{ margin:0, fontSize: TYPOGRAPHY.sizes.h2, fontWeight: TYPOGRAPHY.weights.bold, color: COLORS.navyBody }}>{plan.slideTitle}</h2>
        {plan.leadSubheading && <p style={{ margin:0, fontSize: TYPOGRAPHY.sizes.lead, fontWeight: TYPOGRAPHY.weights.bold, color: COLORS.primaryPurpleDark }}>{plan.leadSubheading}</p>}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:`${SPACING.gridGap * 2}px ${SPACING.gridGap}px`, marginTop:12 }}>
          {items.slice(0, 4).map(item => (
            <div key={item.number} style={{ display:'flex', flexDirection:'column', gap:6 }}>
              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <span style={{ fontSize:20, fontWeight: TYPOGRAPHY.weights.bold, color: COLORS.primaryPurpleDark }}>{item.number}</span>
                <div style={{ flex:1, height:1, background: COLORS.primaryPurpleDark, opacity:0.4 }} />
              </div>
              <span style={{ fontSize: TYPOGRAPHY.sizes.body, fontWeight: TYPOGRAPHY.weights.bold, color: COLORS.navyBody }}>{item.title}</span>
              {item.body && <p style={{ margin:0, fontSize: TYPOGRAPHY.sizes.body - 1, color: COLORS.purpleSubtext, lineHeight: TYPOGRAPHY.lineHeights.body }}>{item.body}</p>}
            </div>
          ))}
        </div>
        {plan.body && <p style={{ margin:'16px 0 0', fontSize: TYPOGRAPHY.sizes.body, fontStyle:'italic', color: COLORS.purpleSubtext, lineHeight: TYPOGRAPHY.lineHeights.body }}>{plan.body}</p>}
      </div>
      <Footer {...plan.footer} />
    </div>
  );
}
