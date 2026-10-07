/**
 * Shared domain types for NN Drama.
 *
 * These types are the contract between the web app, the browser worker,
 * the code generator and the AI abstraction layer.
 */

export type ScanStatus = "queued" | "running" | "completed" | "failed";

export type ProgressState = "pending" | "active" | "done" | "error";

export interface ProgressStep {
  key: string;
  label: string;
  state: ProgressState;
  detail?: string;
  at?: string;
}

export type ViewportName = "desktop" | "tablet" | "mobile";

export interface ViewportSize {
  name: ViewportName;
  width: number;
  height: number;
}

export const DEFAULT_VIEWPORTS: ViewportSize[] = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "mobile", width: 390, height: 844 },
];

export type Framework = "nextjs" | "react" | "html";

export interface ColorToken {
  role: string;
  hex: string;
  rgb: string;
  hsl: string;
  usageCount: number;
  frequency: number;
}

export interface TypographyToken {
  role: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  lineHeight: string;
  letterSpacing: string;
  count: number;
}

export interface SpacingToken {
  value: number;
  unit: string;
  count: number;
}

export interface LayoutInfo {
  maxContentWidth: number;
  containerWidth: number;
  gridColumns: number;
  usesFlex: number;
  usesGrid: number;
  usesAbsolute: number;
  usesSticky: number;
  alignment: string;
}

export interface FontInfo {
  family: string;
  source: string;
  weights: number[];
  usageCount: number;
}

export interface DesignSystem {
  colors: ColorToken[];
  typography: TypographyToken[];
  spacing: SpacingToken[];
  layout: LayoutInfo;
  fonts: FontInfo[];
  radius: number[];
  shadows: string[];
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ComponentNode {
  id: string;
  type: string;
  tag: string;
  label: string;
  selector?: string;
  confidence: number;
  boundingBox: BoundingBox;
  text?: string;
  children: ComponentNode[];
}

export interface DetectedComponent {
  type: string;
  count: number;
  selector: string;
  confidence: number;
}

export interface AssetItem {
  id: string;
  type: "image" | "svg" | "icon" | "logo" | "background" | "video" | "font";
  url: string;
  alt?: string;
  format?: string;
  width?: number;
  height?: number;
  location: string;
  usage: string;
}

export interface ScreenshotRef {
  viewport: ViewportName;
  url: string;
  storageKey: string;
  width: number;
  height: number;
  capturedAt: string;
}

export interface ResponsiveChange {
  kind: string;
  viewport: ViewportName;
  detail: string;
}

export interface InteractionInfo {
  type: string;
  selector: string;
  states: string[];
}

export interface HeadingInfo {
  level: number;
  text: string;
}

export interface PageSummary {
  headings: HeadingInfo[];
  links: number;
  forms: number;
  images: number;
  sections: number;
}

export interface ScanMeta {
  scannedAt: string;
  durationMs: number;
  viewports: ViewportSize[];
  htmlBytes: number;
}

export interface ScanReport {
  url: string;
  finalUrl: string;
  title: string;
  description?: string;
  favicon?: string;
  language?: string;
  designSystem: DesignSystem;
  components: ComponentNode;
  componentList: DetectedComponent[];
  assets: AssetItem[];
  screenshots: ScreenshotRef[];
  responsive: ResponsiveChange[];
  interactions: InteractionInfo[];
  page: PageSummary;
  meta: ScanMeta;
}

export interface DesignSpec {
  url: string;
  title: string;
  visualStyle: {
    style: string;
    mood: string;
    hierarchy: string;
    density: string;
    language: string;
  };
  colors: ColorToken[];
  typography: TypographyToken[];
  spacing: SpacingToken[];
  layout: LayoutInfo;
  components: DetectedComponent[];
  responsive: ResponsiveChange[];
  interactions: InteractionInfo[];
  content: PageSummary;
}

export interface GeneratedFile {
  path: string;
  content: string;
  language: string;
}

export interface GeneratedProject {
  framework: Framework;
  entry: string;
  files: GeneratedFile[];
}

export interface ComparisonScores {
  overall: number;
  layout: number;
  colors: number;
  typography: number;
  spacing: number;
  components: number;
  responsive: number;
}

export interface ComparisonResult {
  baseScreenshot: string;
  targetScreenshot: string;
  viewport: ViewportName;
  scores: ComparisonScores;
  notes: string[];
  /**
   * How the scores were produced. `measured` = computed from real pixel/color
   * analysis; `estimated` = heuristic from design-system deltas.
   */
  method: "measured" | "estimated";
  at: string;
}

export interface RefineIteration {
  iteration: number;
  overall: number;
  changes: string[];
  at: string;
}

export interface ProjectRecord {
  id: string;
  name: string;
  url: string;
  scanId?: string;
  createdAt: string;
  updatedAt: string;
  status: ScanStatus;
  framework: Framework;
  similarity?: number;
  thumbnail?: string;
}

export interface ScanRecord {
  id: string;
  projectId: string;
  url: string;
  status: ScanStatus;
  framework: Framework;
  createdAt: string;
  updatedAt: string;
  progress: ProgressStep[];
  error?: string;
  report?: ScanReport;
  designSpec?: DesignSpec;
  prompt?: string;
  project?: GeneratedProject;
  comparison?: ComparisonResult;
  refinements: RefineIteration[];
  aiProvider: string;
}

export interface CreateScanInput {
  url: string;
  framework?: Framework;
  viewports?: ViewportSize[];
  aiProvider?: string;
  options?: {
    waitForNetworkIdle?: boolean;
    fullPage?: boolean;
  };
}
