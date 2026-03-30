import React from 'react';
import { Breadcrumb } from '../shared/Breadcrumb';
import { Logo }        from '../shared/Logo';
import { Footer }      from '../shared/Footer';
import { GlassCard }   from '../shared/GlassCard';
import { AmberCallout } from '../shared/AmberCallout';
import { COLORS, TYPOGRAPHY, SPACING, GRADIENTS } from '../tokens';
import type { SlidePlan } from '../../types/slide.types';

export function LayoutB({ plan }: { plan: SlidePlan }) {
  const cards = plan.cards ?? [];
  return (
    <div style={{ position:'relative', width:1440, height:810, overflow:'hidden', background: GRADIENTS.slideBackground, fontFamily: TYPOGRAPHY.fontFamily }}>
      <Breadcrumb {...plan.breadcrumb} />
      <div style={{ position:'absolute', top:6, right: SPACING.slideMargin, zIndex:12 }}><Logo variant="sub" /></div>
      <div style={{ position:'absolute', top:52, left: SPACING.slideMargin, right: SPACING.slideMargin, bottom:36, display:'flex', flexDirection:'column', gap: SPACING.blockGap }}>
        <h2 style={{ margin:0, fontSize: TYPOGRAPHY.sizes.h2, fontWeight: TYPOGRAPHY.weights.bold, color: COLORS.navyBody }}>{plan.slideTitle}</h2>
        {plan.leadSubheading && <p style={{ margin:0, fontSize: TYPOGRAPHY.sizes.lead, fontWeight: TYPOGRAPHY.weights.bold, color: COLORS.primaryPurpleDark }}>{plan.leadSubheading}</p>}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gridTemplateRows:'1fr 1fr', gap: SPACING.gridGap, flex:1 }}>
          {cards.slice(0, 4).map((card, i) => <GlassCard key={i} title={card.title} body={card.body} style={{ height:'100%' }} />)}
        </div>
        {plan.callout && <AmberCallout text={plan.callout} />}
      </div>
      <Footer {...plan.footer} />
    </div>
  );
}
