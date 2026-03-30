import React from 'react';
import { Breadcrumb }      from '../shared/Breadcrumb';
import { Logo }             from '../shared/Logo';
import { Footer }           from '../shared/Footer';
import { CornerBlob }       from '../shared/CornerBlob';
import { AccentBar }        from '../shared/AccentBar';
import { StatCard }         from '../shared/StatCard';
import { QuoteBlock }       from '../shared/QuoteBlock';
import { BulletList }       from '../shared/BulletList';
import { ContentBand }      from '../shared/ContentBand';
import { AmberCallout }     from '../shared/AmberCallout';
import { COLORS, TYPOGRAPHY, SPACING, CANVAS, GRADIENTS } from '../tokens';
import type { SlidePlan } from '../../types/slide.types';

export function LayoutG({ plan }: { plan: SlidePlan }) {
  const stats = plan.stats ?? [];

  return (
    <div style={{ position:'relative', width: CANVAS.width, height: CANVAS.height, overflow:'hidden', background: GRADIENTS.slideBackground, fontFamily: TYPOGRAPHY.fontFamily }}>
      <CornerBlob />
      <Breadcrumb {...plan.breadcrumb} />
      <div style={{ position:'absolute', top:8, right: SPACING.cornerSize + 12, zIndex:12 }}><Logo variant="sub" /></div>

      <div style={{
        position:'absolute', top: 48, left: SPACING.slideMargin, right: SPACING.slideMargin, bottom: 40,
        display:'flex', flexDirection:'column', gap: SPACING.blockGap + 4,
      }}>
        {/* Title */}
        <div style={{ display:'flex', alignItems:'flex-start', gap: 14 }}>
          <AccentBar style={{ marginTop: 6 }} />
          <div style={{ display:'flex', flexDirection:'column', gap: 4 }}>
            <h1 style={{
              margin:0, fontSize: TYPOGRAPHY.sizes.h1,
              fontWeight: TYPOGRAPHY.weights.bold, color: COLORS.primaryPurpleDeeper,
              letterSpacing: '-0.02em',
            }}>{plan.slideTitle}</h1>
            {plan.leadSubheading && (
              <p style={{ margin:0, fontSize: TYPOGRAPHY.sizes.lead, fontWeight: TYPOGRAPHY.weights.semibold, color: COLORS.primaryPurpleDark }}>{plan.leadSubheading}</p>
            )}
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display:'grid', gridTemplateColumns: `repeat(${stats.length}, 1fr)`, gap: SPACING.gridGap }}>
          {stats.map((stat, i) => (
            <StatCard
              key={i}
              value={stat.value}
              label={stat.label}
              context={stat.context}
              accentColor={i % 2 === 0 ? COLORS.primaryPurpleDeeper : COLORS.orange}
            />
          ))}
        </div>

        {/* Optional content below stats */}
        {plan.body && (
          <ContentBand>
            <p style={{ margin:0, fontSize: TYPOGRAPHY.sizes.bodyLg, color: COLORS.navyBody, lineHeight: TYPOGRAPHY.lineHeights.relaxed }}>{plan.body}</p>
          </ContentBand>
        )}

        {plan.quote && <QuoteBlock text={plan.quote.text} attribution={plan.quote.attribution} />}

        {plan.bullets && (
          <div style={{ display:'grid', gridTemplateColumns: `repeat(${plan.bullets.length}, 1fr)`, gap: SPACING.gridGap + 4 }}>
            {plan.bullets.map((group, i) => <BulletList key={i} title={group.title} items={group.items} />)}
          </div>
        )}

        {plan.callout && <AmberCallout text={plan.callout} />}
      </div>
      <Footer {...plan.footer} />
    </div>
  );
}
