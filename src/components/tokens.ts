export const COLORS = {
  primaryPurple:       '#7F77DD',
  primaryPurpleDark:   '#534AB7',
  primaryPurpleDeeper: '#3C34A0',
  amber:               '#FBBD23',
  orange:              '#E8823A',
  white:               '#FFFFFF',
  navyBody:            '#1A1340',
  purpleSubtext:       '#3D3A8A',
  cardGlass:           'rgba(255, 255, 255, 0.72)',
  cardBorder:          'rgba(100, 80, 200, 0.15)',
  checklistBg:         'rgba(255, 255, 255, 0.38)',
  tableHeaderBg:       'rgba(200, 190, 240, 0.3)',
  tableBorder:         'rgba(100, 80, 200, 0.2)',
  tableRowDivider:     'rgba(100, 80, 200, 0.12)',
} as const;

export const GRADIENTS = {
  slideBackground: 'linear-gradient(135deg, #E8DEFA 0%, #D8C8F6 40%, #C5B6F0 70%, #A8C8F8 100%)',
  rightBlob:       'linear-gradient(160deg, #4A45C8 0%, #3258C8 40%, #1A3A9F 100%)',
  logo:            'linear-gradient(90deg, #EF4444, #F97316, #EAB308, #22C55E, #3B82F6, #8B5CF6)',
} as const;

export const TYPOGRAPHY = {
  fontFamily: "'Noto Sans', 'Noto Sans JP', system-ui, sans-serif",
  sizes: {
    h1:         44,
    h2:         26,
    lead:       17,
    body:       14,
    cardTitle:  14,
    tableKey:   13,
    breadcrumb: 10,
    footer:     11,
    callout:    14,
    stepTitle:  12,
    stepBody:   13,
  },
  weights:     { regular: 400, medium: 500, bold: 700, black: 800 },
  lineHeights: { title: 1.2, body: 1.65, tight: 1.15 },
} as const;

export const SPACING = {
  slideMargin:    56,
  cardPadding:    18,
  gridGap:        18,
  blockGap:       14,
  cardRadius:     10,
  logoRadius:     11,
  stepIconSize:   30,
  stepIconRadius:  6,
  calloutRadius:   8,
  accentBarW:      4,
  accentBarH:     70,
} as const;

export const CANVAS = {
  width:           1440,
  height:           810,
  leftPanelRatio:  0.60,
  rightPanelRatio: 0.40,
} as const;
