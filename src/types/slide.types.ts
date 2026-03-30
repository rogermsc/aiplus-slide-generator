// ─── Input ────────────────────────────────────────────────────────────────

export interface ModuleDoc {
  moduleTitle:       string;   // Extracted from first H1
  sessionLabel:      string;   // e.g. "SESSION 1"
  moduleLabel:       string;   // e.g. "MODULE 3"
  courseLabel:       string;   // e.g. "AI+PRO"
  domain:            string;   // e.g. "aiplus.domain"
  globalSlideOffset: number;   // Slides preceding this module in the course (0 for first module)
  sections:          Section[];
}

export interface Section {
  heading:    string;
  level:      2 | 3;
  body:       string;       // Concatenated paragraph text under this heading
  bullets:    string[];     // Top-level list items
  codeBlocks: string[];     // Fenced code blocks
  tables:     string[][][]; // Array of tables → rows → cells
}

// ─── Plan ─────────────────────────────────────────────────────────────────

export type LayoutType = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';

export interface SlidePlan {
  index:           number;         // 1-based, module-local
  globalIndex:     number;         // 1-based, course-global = globalSlideOffset + index
  layout:          LayoutType;
  slideTitle:      string;
  leadSubheading?: string;
  body?:           string;         // 1–3 sentence paragraph
  cards?:          CardItem[];     // Layout B = 4 items; Layout C = 2 items
  steps?:          StepItem[];     // Layout D: 2–4 items
  summaryItems?:   SummaryItem[];  // Layout E: exactly 4 items
  tableData?:      TableData;      // For DataTable component
  checklistItems?: string[];       // For CheckListBox component
  bullets?:        BulletGroup[];   // Multi-column bullet lists (2-3 groups)
  stats?:          StatItem[];     // 2-4 stat callouts
  quote?:          QuoteData;      // Styled attributed quote
  iconItems?:      IconItem[];     // 3-4 icon/feature grid items
  transformation?: Transformation; // Before/after comparison
  callout?:        string;         // Amber callout — max one per slide
  speakerNotes?:   string;         // 2–4 sentence presenter script
  rightPanel:      RightPanel;
  breadcrumb:      BreadcrumbData;
  footer:          FooterData;
  imagePrompt?:    string;         // Gemini prompt when rightPanel.type === 'photo'
}

export interface CardItem    { title: string; body: string; bullets?: string[]; }
export interface StepItem    { number: number; title: string; body: string; }
export interface SummaryItem { number: string; title: string; body?: string; }
export interface TableData   { headers: string[]; rows: string[][]; }

export interface BulletGroup    { title?: string; items: string[]; }
export interface StatItem       { value: string; label: string; context?: string; }
export interface QuoteData      { text: string; attribution?: string; }
export interface IconItem       { icon: string; title: string; body: string; }
export interface Transformation { before: { title: string; items: string[] }; after: { title: string; items: string[] }; }

export interface RightPanel {
  type:       'photo' | 'blob';
  imagePath?: string;   // Populated after Stage 3
}

export interface BreadcrumbData {
  course:  string;
  session: string;
  module:  string;
}

export interface FooterData {
  domain:     string;
  pageNumber: number;   // Equals globalIndex — course-global page number
}

// ─── Course ───────────────────────────────────────────────────────────────

export interface ModuleManifestEntry {
  moduleSlug:       string;
  moduleTitle:      string;
  slideCount:       number;
  globalSlideStart: number;
  globalSlideEnd:   number;
  componentDir:     string;   // Relative path to slides/ directory
  pptxPath:         string;   // Relative path to export.pptx
}

export interface CourseManifest {
  courseTitle:  string;
  courseSlug:   string;
  generatedAt:  string;       // ISO timestamp
  totalSlides:  number;
  modules:      ModuleManifestEntry[];
}

// ─── Output ───────────────────────────────────────────────────────────────

export interface GeneratorOutput {
  moduleSlug:     string;
  slides:         SlidePlan[];
  componentPaths: string[];
  pptxPath:       string;
}
