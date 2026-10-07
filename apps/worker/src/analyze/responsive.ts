import type { ResponsiveChange, ViewportName } from "@nn/shared";
import type { RawPageData } from "../extract/types";

export function analyzeResponsive(
  raw: Partial<Record<ViewportName, RawPageData>>,
): ResponsiveChange[] {
  const changes: ResponsiveChange[] = [];
  const desktop = raw.desktop;
  const tablet = raw.tablet;
  const mobile = raw.mobile;

  const compare = (a: RawPageData | undefined, b: RawPageData | undefined, name: ViewportName) => {
    if (!a || !b) return;

    const h1a = a.elements.find((e) => e.tag === "h1");
    const h1b = b.elements.find((e) => e.tag === "h1");
    if (h1a && h1b && Math.abs(h1a.fontSize - h1b.fontSize) >= 2) {
      changes.push({
        viewport: name,
        kind: "font-scale",
        detail: `H1 scales from ${h1a.fontSize}px to ${h1b.fontSize}px`,
      });
    }

    if (b.scrollWidth > b.viewport.width + 4) {
      changes.push({
        viewport: name,
        kind: "horizontal-overflow",
        detail: `Page content (${b.scrollWidth}px) exceeds viewport (${b.viewport.width}px)`,
      });
    }

    const elementDelta = a.elements.length - b.elements.length;
    if (Math.abs(elementDelta) > a.elements.length * 0.15) {
      changes.push({
        viewport: name,
        kind: elementDelta > 0 ? "hidden-elements" : "revealed-elements",
        detail: `${Math.abs(elementDelta)} element(s) ${elementDelta > 0 ? "hidden" : "revealed"} vs desktop`,
      });
    }

    const multiCol = (r: RawPageData) =>
      r.elements.filter((e) => e.display === "grid").length;
    if (multiCol(a) > multiCol(b)) {
      changes.push({
        viewport: name,
        kind: "grid-collapse",
        detail: "Multi-column grids collapse to a single column",
      });
    }

    const stacked = b.landmarks.length > a.landmarks.length * 1.2;
    if (stacked) {
      changes.push({
        viewport: name,
        kind: "stacked-layout",
        detail: "Sections reflow into a vertical stack",
      });
    }
  };

  compare(desktop, tablet, "tablet");
  compare(desktop, mobile, "mobile");
  compare(tablet, mobile, "mobile");

  if (changes.length === 0) {
    changes.push({
      viewport: "mobile",
      kind: "stable-layout",
      detail: "Layout remains structurally consistent across breakpoints",
    });
  }

  return dedupe(changes);
}

function dedupe(list: ResponsiveChange[]): ResponsiveChange[] {
  const seen = new Set<string>();
  return list.filter((c) => {
    const k = c.viewport + c.kind + c.detail;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}
