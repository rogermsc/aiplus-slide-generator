import React from 'react';
import { Breadcrumb }   from '../shared/Breadcrumb';
import { Logo }          from '../shared/Logo';
import { Footer }        from '../shared/Footer';
import { CornerBlob }    from '../shared/CornerBlob';
import { StepIcon }      from '../shared/StepIcon';
import { ContentBand }   from '../shared/ContentBand';
import { AmberCallout }  from '../shared/AmberCallout';
import { COLORS, TYPOGRAPHY, SPACING, CANVAS, GRADIENTS } from '../tokens';
import type { SlidePlan } from '../../types/slide.types';

export function LayoutD({ plan }: { plan: SlidePlan }) {
  const steps = plan.steps ?? [];

  return (
    <div style={{ position:'relative', width: CANVAS.width, height: CANVAS.height, overflow:'hidden', background: GRADIENTS.slideBackground, fontFamily: TYPOGRAPHY.fontFamily }}>
      <CornerBlob />
      <Breadcrumb {...plan.breadcrumb} />
      <div style={{ position:'absolute', top:8, right: SPACING.cornerSize + 12, zIndex:12 }}><Logo variant="sub" /></div>

      <div style={{
        position:'absolute', top: 48, left: SPACING.slideMargin, right: SPACING.slideMargin, bottom: 40,
        display:'flex', flexDirection:'column', gap: SPACING.blockGap + 2,
      }}>
        <h1 style={{
          margin:0, fontSize: TYPOGRAPHY.sizes.h1,
          fontWeight: TYPOGRAPHY.weights.bold, color: COLORS.primaryPurpleDeeper,
          letterSpacing: '-0.02em',
        }}>{plan.slideTitle}</h1>
        {plan.leadSubheading && (
          <p style={{ margin:0, fontSize: TYPOGRAPHY.sizes.lead, fontWeight: TYPOGRAPHY.weights.semibold, color: COLORS.primaryPurpleDark }}>{plan.leadSubheading}</p>
        )}

        {/* Steps as full-width content bands */}
        <div style={{ display:'flex', flexDirection:'column', gap: SPACING.gridGap, flex:1 }}>
          {steps.map(step => {
            const isOdd = step.number % 2 !== 0;
            const accentColor = isOdd ? COLORS.orange : COLORS.primaryPurpleDeeper;
            return (
              <ContentBand key={step.number} style={{
                borderLeft: `4px solid ${accentColor}`,
                display:'flex', gap: 18, alignItems:'flex-start',
                flex:1,
              }}>
                <StepIcon number={step.number} />
                <div style={{ display:'flex', flexDirection:'column', gap: 6, flex:1 }}>
                  <span style={{
                    fontSize: TYPOGRAPHY.sizes.stepTitle,
                    fontWeight: TYPOGRAPHY.weights.bold, color: accentColor,
                    lineHeight: TYPOGRAPHY.lineHeights.tight,
                  }}>{step.title}</span>
                  <p style={{
                    margin:0, fontSize: TYPOGRAPHY.sizes.stepBody,
                    color: COLORS.navyBody, lineHeight: TYPOGRAPHY.lineHeights.relaxed,
                  }}>{step.body}</p>
                </div>
              </ContentBand>
            );
          })}
        </div>

        {plan.callout && <AmberCallout text={plan.callout} />}
      </div>
      <Footer {...plan.footer} />
    </div>
  );
}
