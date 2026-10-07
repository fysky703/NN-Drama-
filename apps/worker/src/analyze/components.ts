import type { ComponentNode, DetectedComponent } from "@nn/shared";
import type { RawLandmark, RawPageData } from "../extract/types";

const KEYWORDS: [string, RegExp][] = [
  ["Pricing card", /\b(pricing|per month|per user|\/mo|\/month|\$)/i],
  ["Testimonial", /\b(testimonial|review|what our|said about|loved by|customers say)/i],
  ["Feature card", /\b(feature|benefit|why choose|everything you)/i],
  ["Search", /\b(search|find)/i],
  ["Accordion", /\b(faq|frequently asked|accordion)/i],
  ["Tabs", /\b(tab|tabs)/i],
  ["Stats", /\b(stats|uptime|users|countries|trusted by)/i],
];

export function analyzeComponents(raw: RawPageData): {
  list: DetectedComponent[];
  tree: ComponentNode;
} {
  const detected: DetectedComponent[] = [];
  const pageChildren: ComponentNode[] = [];

  const nav = raw.landmarks.find((l) => l.tag === "nav" || l.tag === "header");
  if (nav || raw.links.length > 3) {
    detected.push({ type: "Navbar", count: 1, selector: "header, nav", confidence: nav ? 0.95 : 0.6 });
    pageChildren.push(node("Navbar", "header", "Primary navigation", nav?.rect));
  }

  const headings = raw.headings;
  const heroHeading = headings.find((h) => h.level === 1);
  const topSections = [...raw.landmarks]
    .filter((l) => l.tag === "section" || l.tag === "main")
    .sort((a, b) => a.rect.y - b.rect.y);

  if (heroHeading || topSections.length > 0) {
    detected.push({ type: "Hero", count: 1, selector: "h1", confidence: heroHeading ? 0.85 : 0.5 });
    pageChildren.push({
      id: "hero",
      type: "Hero",
      tag: "section",
      label: truncate(heroHeading?.text ?? "Hero section"),
      selector: "h1",
      confidence: heroHeading ? 0.85 : 0.5,
      boundingBox: toBox(topSections[0]?.rect),
      children: [
        node("Heading", "h1", truncate(heroHeading?.text ?? "Headline"), undefined),
        node("Description", "p", "Sub-headline"),
        node("CTA", "button", "Primary call to action"),
      ],
    });
  }

  const sectionTypes = new Set<string>();
  for (const section of topSections.slice(1)) {
    const text = landmarkText(section, raw);
    const type = classify(text) ?? (section.tag === "footer" ? "Footer" : "Section");
    sectionTypes.add(type);
    detected.push({
      type,
      count: 1,
      selector: selectorFor(section),
      confidence: classify(text) ? 0.75 : 0.45,
    });
  }

  for (const [type, re] of KEYWORDS) {
    if (re.test(raw.headings.map((h) => h.text).join(" ")) && !sectionTypes.has(type)) {
      detected.push({ type, count: countOccurrences(raw, re), selector: "section", confidence: 0.6 });
    }
  }

  if (raw.forms > 0) {
    detected.push({ type: "Form", count: raw.forms, selector: "form", confidence: 0.9 });
    pageChildren.push(node("Form", "form", `${raw.forms} form(s)`));
  }

  const footer = raw.landmarks.find((l) => l.tag === "footer");
  if (footer) {
    detected.push({ type: "Footer", count: 1, selector: "footer", confidence: 0.95 });
    pageChildren.push(node("Footer", "footer", "Site footer", footer.rect));
  }

  detected.push({
    type: "Button",
    count: raw.buttons.length,
    selector: "button, a[role=button]",
    confidence: 0.8,
  });
  if (raw.svgCount > 0) {
    detected.push({ type: "Icon", count: raw.svgCount, selector: "svg", confidence: 0.7 });
  }
  if (raw.elements.some((e) => e.tag === "table")) {
    detected.push({ type: "Table", count: countTags(raw, "table"), selector: "table", confidence: 0.85 });
  }

  const merged = mergeComponents(detected);

  return {
    list: merged,
    tree: {
      id: "page",
      type: "Page",
      tag: "body",
      label: raw.title || "Page",
      confidence: 1,
      boundingBox: { x: 0, y: 0, width: raw.viewport.width, height: raw.scrollHeight },
      children: pageChildren,
    },
  };
}

function node(type: string, tag: string, label: string, rect?: RawLandmark["rect"]): ComponentNode {
  return {
    id: type.toLowerCase() + "-" + tag,
    type,
    tag,
    label,
    confidence: 0.7,
    boundingBox: toBox(rect),
    children: [],
  };
}

function toBox(rect?: RawLandmark["rect"]) {
  return rect
    ? { x: rect.x, y: rect.y, width: rect.width, height: rect.height }
    : { x: 0, y: 0, width: 0, height: 0 };
}

function selectorFor(l: RawLandmark): string {
  if (l.id) return `#${l.id}`;
  if (l.classes.length) return `${l.tag}.${l.classes[0]}`;
  return l.tag;
}

function landmarkText(l: RawLandmark, raw: RawPageData): string {
  return raw.elements
    .filter((e) => e.rect.y >= l.rect.y - 20 && e.rect.y <= l.rect.y + l.rect.height + 20)
    .map((e) => e.text)
    .join(" ")
    .slice(0, 400);
}

function classify(text: string): string | null {
  for (const [type, re] of KEYWORDS) {
    if (re.test(text)) return type;
  }
  return null;
}

function countOccurrences(raw: RawPageData, re: RegExp): number {
  return raw.elements.filter((e) => e.text && re.test(e.text)).length || 1;
}

function countTags(raw: RawPageData, tag: string): number {
  return raw.elements.filter((e) => e.tag === tag).length || 1;
}

function mergeComponents(list: DetectedComponent[]): DetectedComponent[] {
  const map = new Map<string, DetectedComponent>();
  for (const c of list) {
    const cur = map.get(c.type);
    if (cur) {
      cur.count += c.count;
      cur.confidence = Math.max(cur.confidence, c.confidence);
    } else {
      map.set(c.type, { ...c });
    }
  }
  return [...map.values()].sort((a, b) => b.count - a.count);
}

function truncate(s: string, n = 80): string {
  return s.length > n ? s.slice(0, n) + "…" : s;
}
