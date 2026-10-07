import type { SpacingToken } from "@nn/shared";
import type { RawPageData } from "../extract/types";

const CANONICAL = [2, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128];

export function analyzeSpacing(raw: RawPageData): SpacingToken[] {
  const counts = new Map<number, number>();

  const bump = (value: number, weight = 1) => {
    if (!Number.isFinite(value) || value <= 0 || value > 400) return;
    const snapped = snap(value);
    counts.set(snapped, (counts.get(snapped) ?? 0) + weight);
  };

  for (const el of raw.elements) {
    for (const v of el.padding) bump(v);
    for (const v of el.margin) bump(v);
    if (el.rect.width > 200) bump(el.rect.width);
  }

  let tokens: SpacingToken[] = [...counts.entries()]
    .map(([value, count]) => ({ value, unit: "px", count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 16)
    .sort((a, b) => a.value - b.value);

  if (tokens.length < 4) {
    tokens = CANONICAL.map((value, i) => ({ value, unit: "px", count: 16 - i }));
  }

  return tokens;
}

function snap(value: number): number {
  let best = CANONICAL[0];
  let bestDelta = Infinity;
  for (const c of CANONICAL) {
    const d = Math.abs(c - value);
    if (d < bestDelta) {
      bestDelta = d;
      best = c;
    }
  }
  return bestDelta <= 3 ? best : Math.round(value);
}

export function analyzeRadius(raw: RawPageData): number[] {
  const values = new Set<number>();
  for (const el of raw.elements) {
    const first = parseFloat(el.borderRadius);
    if (Number.isFinite(first) && first > 0 && first < 200) values.add(Math.round(first));
  }
  return [...values].sort((a, b) => a - b).slice(0, 6);
}

export function analyzeShadows(raw: RawPageData): string[] {
  const values = new Set<string>();
  for (const el of raw.elements) {
    if (el.boxShadow && el.boxShadow !== "none" && !el.boxShadow.startsWith("rgba(0, 0, 0, 0)")) {
      values.add(el.boxShadow);
    }
    if (values.size >= 6) break;
  }
  return [...values].slice(0, 6);
}
