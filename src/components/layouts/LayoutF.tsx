import React from 'react';
import { Breadcrumb }       from '../shared/Breadcrumb';
import { Logo }              from '../shared/Logo';
import { Footer }            from '../shared/Footer';
import { CornerBlob }        from '../shared/CornerBlob';
import { SectionBar }        from '../shared/SectionBar';
import { IconFeatureCard }   from '../shared/IconFeatureCard';
import { AmberCallout }      from '../shared/AmberCallout';
import { COLORS, TYPOGRAPHY, SPACING, CANVAS, GRADIENTS } from '../tokens';
import type { SlidePlan } from '../../types/slide.types';

export function LayoutF({ plan }: { plan: SlidePlan }) {
  const items = plan.iconItems ?? [];
  const cols = items.length <= 3 ? 3 : items.length;

  return (
    <div style={{ position:'relative', width: CANVAS.width, height: CANVAS.height, overflow:'hidden', background: GRADIENTS.slideBackground, fontFamily: TYPOGRAPHY.fontFamily }}>
      <CornerBlob />
      <Breadcrumb {...plan.breadcrumb} />
      <div style={{ position:'absolute', top:8, right: SPACING.cornerSize + 12, zIndex:12 }}><Logo variant="sub" /></div>

      <div style={{
        position:'absolute', top: 48, left: SPACING.slideMargin, right: SPACING.slideMargin, bottom: 40,
        display:'flex', flexDirection:'column', gap: SPACING.blockGap + 2,
      }}>
        <div style={{ display:'flex', flexDirection:'column', gap: 6 }}>
          <h2 style={{
            margin:0, fontSize: TYPOGRAPHY.sizes.h2,
            fontWeight: TYPOGRAPHY.weights.bold, color: COLORS.navyBody,
            letterSpacing: '-0.01em',
          }}>{plan.slideTitle}</h2>
          {plan.leadSubheading && <SectionBar text={plan.leadSubheading} />}
        </div>

        {/* Icon/Feature grid */}
        <div style={{
          display:'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gap: SPACING.gridGap, flex: 1,
        }}>
          {items.map((item, i) => (
            <IconFeatureCard
              key={i}
              icon={item.icon}
              title={item.title}
              body={item.body}
              accentColor={i % 2 === 0 ? COLORS.primaryPurpleDeeper : COLORS.orange}
            />
          ))}
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
