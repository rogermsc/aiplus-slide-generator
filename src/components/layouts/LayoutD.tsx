import React from 'react';
import { Breadcrumb } from '../shared/Breadcrumb';
import { Logo }        from '../shared/Logo';
import { Footer }      from '../shared/Footer';
import { StepIcon }    from '../shared/StepIcon';
import { AmberCallout } from '../shared/AmberCallout';
import { COLORS, TYPOGRAPHY, SPACING, GRADIENTS } from '../tokens';
import type { SlidePlan } from '../../types/slide.types';

export function LayoutD({ plan }: { plan: SlidePlan }) {
  const steps = plan.steps ?? [];
  return (
    <div style={{ position:'relative', width:1440, height:810, overflow:'hidden', background: GRADIENTS.slideBackground, fontFamily: TYPOGRAPHY.fontFamily }}>
      <Breadcrumb {...plan.breadcrumb} />
      <div style={{ position:'absolute', top:6, right: SPACING.slideMargin, zIndex:12 }}><Logo variant="sub" /></div>
      <div style={{ position:'absolute', top:52, left: SPACING.slideMargin, right: SPACING.slideMargin, bottom:36, display:'flex', flexDirection:'column', justifyContent:'center', gap: SPACING.blockGap }}>
        <h1 style={{ margin:0, fontSize: TYPOGRAPHY.sizes.h1, fontWeight: TYPOGRAPHY.weights.bold, color: COLORS.primaryPurpleDark }}>{plan.slideTitle}</h1>
        {plan.leadSubheading && <p style={{ margin:0, fontSize: TYPOGRAPHY.sizes.lead, fontWeight: TYPOGRAPHY.weights.bold, color: COLORS.primaryPurpleDark }}>{plan.leadSubheading}</p>}
        <div style={{ display:'grid', gridTemplateColumns: steps.length > 2 ? '1fr 1fr' : '1fr', gap: SPACING.gridGap, marginTop: 8 }}>
          {steps.map(step => {
            const isOdd   = step.number % 2 !== 0;
            const tcColor = isOdd ? COLORS.orange : COLORS.primaryPurpleDark;
            return (
              <div key={step.number} style={{ display:'flex', gap:14, alignItems:'flex-start' }}>
                <StepIcon number={step.number} />
                <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
                  <span style={{ fontSize: TYPOGRAPHY.sizes.stepTitle, fontWeight: TYPOGRAPHY.weights.bold, color: tcColor }}>{step.title}</span>
                  <p style={{ margin:0, fontSize: TYPOGRAPHY.sizes.body, color: COLORS.navyBody, lineHeight: TYPOGRAPHY.lineHeights.body }}>{step.body}</p>
                </div>
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
