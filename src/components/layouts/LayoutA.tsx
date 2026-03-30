import React from 'react';
import { Breadcrumb } from '../shared/Breadcrumb';
import { Logo }        from '../shared/Logo';
import { Footer }      from '../shared/Footer';
import { AccentBar }   from '../shared/AccentBar';
import { AmberCallout } from '../shared/AmberCallout';
import { DataTable }   from '../shared/DataTable';
import { CheckListBox } from '../shared/CheckListBox';
import { COLORS, TYPOGRAPHY, SPACING, CANVAS, GRADIENTS } from '../tokens';
import type { SlidePlan } from '../../types/slide.types';

export function LayoutA({ plan }: { plan: SlidePlan }) {
  const leftW  = CANVAS.width * CANVAS.leftPanelRatio;
  const rightW = CANVAS.width * CANVAS.rightPanelRatio;

  return (
    <div style={{ position:'relative', width:1440, height:810, overflow:'hidden', background: GRADIENTS.slideBackground, fontFamily: TYPOGRAPHY.fontFamily }}>

      {/* Right panel */}
      <div style={{ position:'absolute', top:0, right:0, width:rightW, height:810, overflow:'hidden' }}>
        {plan.rightPanel.type === 'photo' && plan.rightPanel.imagePath
          ? <img src={plan.rightPanel.imagePath} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
          : <div style={{ width:'100%', height:'100%', background: GRADIENTS.rightBlob, borderRadius:'0 0 0 80px' }} />
        }
      </div>

      <Breadcrumb {...plan.breadcrumb} />

      <div style={{ position:'absolute', top:6, right: rightW + 16, zIndex:12 }}>
        <Logo variant="sub" />
      </div>

      <div style={{
        position:'absolute', top:52, left: SPACING.slideMargin,
        width: leftW - SPACING.slideMargin * 2, height: 810 - 52 - 36,
        display:'flex', flexDirection:'column', justifyContent:'center', gap: SPACING.blockGap,
      }}>
        <AccentBar style={{ marginBottom: 4 }} />
        <h1 style={{ margin:0, fontSize: TYPOGRAPHY.sizes.h1, fontWeight: TYPOGRAPHY.weights.bold, color: COLORS.primaryPurpleDark, lineHeight: TYPOGRAPHY.lineHeights.title }}>{plan.slideTitle}</h1>
        {plan.leadSubheading && <p style={{ margin:0, fontSize: TYPOGRAPHY.sizes.lead, fontWeight: TYPOGRAPHY.weights.bold, color: COLORS.primaryPurpleDark }}>{plan.leadSubheading}</p>}
        {plan.body && <p style={{ margin:0, fontSize: TYPOGRAPHY.sizes.body, fontWeight: TYPOGRAPHY.weights.regular, color: COLORS.navyBody, lineHeight: TYPOGRAPHY.lineHeights.body, maxWidth: 560 }}>{plan.body}</p>}
        {plan.tableData    && <DataTable data={plan.tableData} />}
        {plan.checklistItems && <CheckListBox items={plan.checklistItems} />}
        {plan.callout      && <AmberCallout text={plan.callout} />}
      </div>

      <Footer {...plan.footer} />
    </div>
  );
}
