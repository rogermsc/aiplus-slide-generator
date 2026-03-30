import React from 'react';
import { Breadcrumb }   from '../shared/Breadcrumb';
import { Logo }          from '../shared/Logo';
import { Footer }        from '../shared/Footer';
import { AccentBar }     from '../shared/AccentBar';
import { CornerBlob }    from '../shared/CornerBlob';
import { SectionBar }    from '../shared/SectionBar';
import { ContentBand }   from '../shared/ContentBand';
import { AmberCallout }  from '../shared/AmberCallout';
import { DataTable }     from '../shared/DataTable';
import { CheckListBox }  from '../shared/CheckListBox';
import { QuoteBlock }    from '../shared/QuoteBlock';
import { StatCard }      from '../shared/StatCard';
import { BulletList }    from '../shared/BulletList';
import { TransformationBlock } from '../shared/TransformationBlock';
import { COLORS, TYPOGRAPHY, SPACING, CANVAS, GRADIENTS } from '../tokens';
import type { SlidePlan } from '../../types/slide.types';

export function LayoutA({ plan }: { plan: SlidePlan }) {
  const isOpener = plan.index === 1;
  const hasPhoto = plan.rightPanel.type === 'photo' && plan.rightPanel.imagePath;
  const contentW = CANVAS.width - SPACING.slideMargin * 2;
  const hasSubContent = plan.tableData || plan.checklistItems || plan.callout;

  // Dark opener variant
  if (isOpener) {
    return (
      <div style={{ position:'relative', width: CANVAS.width, height: CANVAS.height, overflow:'hidden', background: GRADIENTS.darkBackground, fontFamily: TYPOGRAPHY.fontFamily }}>
        {/* Photo as background overlay if available */}
        {hasPhoto && (
          <div style={{ position:'absolute', top:0, right:0, width: CANVAS.width * 0.5, height: CANVAS.height, opacity: 0.25 }}>
            <img src={plan.rightPanel.imagePath} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
            <div style={{ position:'absolute', top:0, left:0, width:'100%', height:'100%', background:'linear-gradient(90deg, #0A0820 0%, transparent 100%)' }} />
          </div>
        )}

        <Breadcrumb {...plan.breadcrumb} />

        <div style={{ position:'absolute', top:12, right: SPACING.slideMargin, zIndex:12 }}>
          <Logo variant="full" />
        </div>

        {/* Centered content */}
        <div style={{
          position:'absolute', top: 48, left: SPACING.slideMargin, right: SPACING.slideMargin,
          height: CANVAS.height - 48 - 44,
          display:'flex', flexDirection:'column', justifyContent:'center', gap: 16,
        }}>
          <SectionBar text={plan.breadcrumb.module} />
          <h1 style={{
            margin:0, fontSize: TYPOGRAPHY.sizes.h1Dark,
            fontWeight: TYPOGRAPHY.weights.black, color: COLORS.white,
            lineHeight: TYPOGRAPHY.lineHeights.title, letterSpacing: '-0.02em',
            maxWidth: contentW * 0.7,
          }}>{plan.slideTitle}</h1>
          {plan.leadSubheading && (
            <p style={{ margin:0, fontSize: TYPOGRAPHY.sizes.lead + 2, fontWeight: TYPOGRAPHY.weights.semibold, color: COLORS.primaryPurple, maxWidth: contentW * 0.65 }}>{plan.leadSubheading}</p>
          )}
          {plan.body && (
            <p style={{ margin:0, fontSize: TYPOGRAPHY.sizes.bodyLg, fontWeight: TYPOGRAPHY.weights.regular, color: 'rgba(255,255,255,0.75)', lineHeight: TYPOGRAPHY.lineHeights.relaxed, maxWidth: contentW * 0.6 }}>{plan.body}</p>
          )}
        </div>

        <Footer {...plan.footer} />
      </div>
    );
  }

  // Standard content slide — full width
  return (
    <div style={{ position:'relative', width: CANVAS.width, height: CANVAS.height, overflow:'hidden', background: GRADIENTS.slideBackground, fontFamily: TYPOGRAPHY.fontFamily }}>
      <CornerBlob />
      <Breadcrumb {...plan.breadcrumb} />

      <div style={{ position:'absolute', top:8, right: SPACING.cornerSize + 12, zIndex:12 }}>
        <Logo variant="sub" />
      </div>

      {/* Full-width content area */}
      <div style={{
        position:'absolute', top: 48, left: SPACING.slideMargin, right: SPACING.slideMargin, bottom: 40,
        display:'flex', flexDirection:'column', gap: SPACING.blockGap,
      }}>
        {/* Title cluster */}
        <div style={{ display:'flex', alignItems:'flex-start', gap: 14 }}>
          <AccentBar style={{ marginTop: 6 }} />
          <div style={{ display:'flex', flexDirection:'column', gap: 4, flex:1 }}>
            <h1 style={{
              margin:0, fontSize: TYPOGRAPHY.sizes.h1,
              fontWeight: TYPOGRAPHY.weights.bold, color: COLORS.primaryPurpleDeeper,
              lineHeight: TYPOGRAPHY.lineHeights.title, letterSpacing: '-0.02em',
            }}>{plan.slideTitle}</h1>
            {plan.leadSubheading && (
              <p style={{ margin:0, fontSize: TYPOGRAPHY.sizes.lead, fontWeight: TYPOGRAPHY.weights.semibold, color: COLORS.primaryPurpleDark }}>{plan.leadSubheading}</p>
            )}
          </div>
        </div>

        {/* Content bands */}
        {plan.body && (
          <ContentBand>
            {/* Inline photo if available */}
            <div style={{ display:'flex', gap: 24, alignItems:'flex-start' }}>
              <p style={{
                margin:0, fontSize: TYPOGRAPHY.sizes.bodyLg, fontWeight: TYPOGRAPHY.weights.regular,
                color: COLORS.navyBody, lineHeight: TYPOGRAPHY.lineHeights.relaxed, flex:1,
              }}>{plan.body}</p>
              {hasPhoto && (
                <img src={plan.rightPanel.imagePath} alt="" style={{
                  width: 280, height: 180, objectFit:'cover', borderRadius: SPACING.cardRadius,
                  flexShrink: 0,
                }} />
              )}
            </div>
          </ContentBand>
        )}

        {!plan.body && hasPhoto && (
          <ContentBand style={{ padding: 0, overflow:'hidden', borderRadius: SPACING.cardRadius }}>
            <img src={plan.rightPanel.imagePath} alt="" style={{ width:'100%', height: 280, objectFit:'cover' }} />
          </ContentBand>
        )}

        {plan.tableData && (
          <ContentBand>
            <DataTable data={plan.tableData} />
          </ContentBand>
        )}

        {plan.checklistItems && <CheckListBox items={plan.checklistItems} />}

        {plan.bullets && (
          <div style={{ display:'grid', gridTemplateColumns: `repeat(${plan.bullets.length}, 1fr)`, gap: SPACING.gridGap + 4 }}>
            {plan.bullets.map((group, i) => <BulletList key={i} title={group.title} items={group.items} />)}
          </div>
        )}

        {plan.quote && <QuoteBlock text={plan.quote.text} attribution={plan.quote.attribution} />}

        {plan.stats && (
          <div style={{ display:'grid', gridTemplateColumns: `repeat(${plan.stats.length}, 1fr)`, gap: SPACING.gridGap }}>
            {plan.stats.map((stat, i) => (
              <StatCard key={i} value={stat.value} label={stat.label} context={stat.context}
                accentColor={i % 2 === 0 ? COLORS.primaryPurpleDeeper : COLORS.orange} />
            ))}
          </div>
        )}

        {plan.transformation && <TransformationBlock before={plan.transformation.before} after={plan.transformation.after} />}

        {plan.callout && <AmberCallout text={plan.callout} />}
      </div>

      <Footer {...plan.footer} />
    </div>
  );
}
