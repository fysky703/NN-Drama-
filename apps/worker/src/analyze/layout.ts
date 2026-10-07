import type { LayoutInfo } from "@nn/shared";
import type { RawPageData } from "../extract/types";

export function analyzeLayout(raw: RawPageData): LayoutInfo {
  let usesFlex = 0;
  let usesGrid = 0;
  let usesAbsolute = 0;
  let usesSticky = 0;
  let maxContentWidth = 0;
  let gridColumns = 1;

  for (const el of raw.elements) {
    if (el.display.includes("flex")) usesFlex++;
    if (el.display === "grid") {
      usesGrid++;
      const cols = estimateGridColumns(el.rect.width, raw.viewport.width);
      gridColumns = Math.max(gridColumns, cols);
    }
    if (el.position === "absolute" || el.position === "fixed") usesAbsolute++;
    if (el.position === "sticky") usesSticky++;
    if (el.display !== "inline" && el.rect.width > maxContentWidth) {
      maxContentWidth = Math.min(el.rect.width, raw.scrollWidth || raw.viewport.width);
    }
  }

  if (gridColumns === 1 && usesGrid === 0) {
    // infer from side-by-side sibling blocks
    gridColumns = inferColumnsFromLayout(raw);
  }

  const containerWidth = Math.min(maxContentWidth || raw.viewport.width, raw.viewport.width);

  return {
    maxContentWidth: Math.round(containerWidth),
    containerWidth: Math.round(containerWidth),
    gridColumns,
    usesFlex,
    usesGrid,
    usesAbsolute,
    usesSticky,
    alignment: inferAlignment(raw),
  };
}

function estimateGridColumns(elementWidth: number, viewport: number): number {
  if (viewport >= 1024) {
    if (elementWidth > 1000) return 3;
    if (elementWidth > 700) return 2;
  } else if (viewport >= 640 && elementWidth > 600) {
    return 2;
  }
  return 1;
}

function inferColumnsFromLayout(raw: RawPageData): number {
  const row = raw.elements.filter(
    (e) => Math.abs(e.rect.y - (raw.elements[0]?.rect.y ?? 0)) < 2000 && e.rect.width < 420,
  );
  const byRow = new Map<number, number>();
  for (const e of row) {
    const band = Math.round(e.rect.y / 120);
    byRow.set(band, (byRow.get(band) ?? 0) + 1);
  }
  return Math.max(1, Math.min(4, Math.max(...byRow.values(), 1)));
}

function inferAlignment(raw: RawPageData): string {
  const fills = raw.elements.filter((e) => e.tag === "section" || e.rect.width > raw.viewport.width * 0.6);
  if (fills.length === 0) return "centered";
  const centered = fills.filter((e) => Math.abs(e.rect.width - raw.viewport.width) > 24).length;
  return centered >= fills.length / 2 ? "contained / centered" : "full-width";
}
