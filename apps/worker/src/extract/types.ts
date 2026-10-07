export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface RawElement {
  tag: string;
  role: string | null;
  id: string;
  classes: string[];
  text: string;
  rect: Rect;
  fontSize: number;
  fontWeight: number;
  fontFamily: string;
  lineHeight: string;
  letterSpacing: string;
  color: string;
  backgroundColor: string;
  padding: [number, number, number, number];
  margin: [number, number, number, number];
  borderRadius: string;
  boxShadow: string;
  borderColor: string;
  borderWidth: number;
  display: string;
  position: string;
  depth: number;
}

export interface RawImage {
  src: string;
  alt: string;
  width: number;
  height: number;
  format: string;
}

export interface RawFont {
  family: string;
  weight: number;
  source: string;
}

export interface RawLandmark {
  tag: string;
  id: string;
  classes: string[];
  rect: Rect;
}

export interface RawPageData {
  title: string;
  description: string;
  favicon: string;
  lang: string;
  headings: { level: number; text: string }[];
  links: { href: string; text: string }[];
  forms: number;
  buttons: { text: string; tag: string }[];
  images: RawImage[];
  svgCount: number;
  landmarks: RawLandmark[];
  fonts: RawFont[];
  stylesheetUrls: string[];
  elements: RawElement[];
  htmlBytes: number;
  scrollHeight: number;
  scrollWidth: number;
  bodyBg: string;
  bodyColor: string;
  viewport: { width: number; height: number };
}
