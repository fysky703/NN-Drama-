import type { FontInfo, TypographyToken } from "@nn/shared";
import type { RawElement, RawPageData } from "../extract/types";

export function analyzeTypography(raw: RawPageData): {
  typography: TypographyToken[];
  fonts: FontInfo[];
} {
  const tokens: TypographyToken[] = [];
  const headingTags = ["h1", "h2", "h3", "h4", "h5", "h6"];

  for (const tag of headingTags) {
    const candidates = raw.elements.filter((e) => e.tag === tag && e.text);
    if (candidates.length === 0) continue;
    const el = candidates.sort((a, b) => b.fontSize - a.fontSize)[0];
    tokens.push(token(tag, el, candidates.length));
  }

  const textEls = raw.elements.filter((e) => e.text && !/^h[1-6]$/.test(e.tag));
  const body = pickBody(textEls);
  if (body) tokens.push(token("body", body.el, body.count));

  const smallEls = textEls.filter((e) => e.fontSize < (body?.el.fontSize ?? 16) - 0.5);
  if (smallEls.length > 0) {
    const el = smallEls.sort((a, b) => b.text.length - a.text.length)[0];
    tokens.push(token("small", el, smallEls.length));
  }

  const buttonEls = raw.elements.filter(
    (e) => e.tag === "button" || e.role === "button" || e.tag === "a",
  );
  const btn = buttonEls.find((e) => e.text);
  if (btn) tokens.push(token("button", btn, buttonEls.length));

  return { typography: tokens, fonts: analyzeFonts(raw) };
}

function token(role: string, el: RawElement, count: number): TypographyToken {
  return {
    role,
    fontFamily: firstFamily(el.fontFamily),
    fontSize: round(el.fontSize),
    fontWeight: el.fontWeight,
    lineHeight: el.lineHeight === "normal" ? "normal" : el.lineHeight,
    letterSpacing: el.letterSpacing === "normal" ? "0px" : el.letterSpacing,
    count,
  };
}

function pickBody(els: RawElement[]): { el: RawElement; count: number } | null {
  if (els.length === 0) return null;
  const byKey = new Map<string, { el: RawElement; count: number }>();
  for (const el of els) {
    const k = `${Math.round(el.fontSize)}-${el.fontWeight}-${firstFamily(el.fontFamily)}`;
    const cur = byKey.get(k);
    if (cur) cur.count += el.text.length;
    else byKey.set(k, { el, count: el.text.length });
  }
  return [...byKey.values()].sort((a, b) => b.count - a.count)[0];
}

function analyzeFonts(raw: RawPageData): FontInfo[] {
  const map = new Map<string, FontInfo>();
  for (const el of raw.elements) {
    if (!el.text) continue;
    const family = firstFamily(el.fontFamily);
    const cur = map.get(family) ?? {
      family,
      source: raw.stylesheetUrls.length > 0 ? "stylesheet" : "system",
      weights: [],
      usageCount: 0,
    };
    if (!cur.weights.includes(el.fontWeight)) cur.weights.push(el.fontWeight);
    cur.usageCount += 1;
    map.set(family, cur);
  }
  for (const f of raw.fonts) {
    const family = firstFamily(f.family);
    const cur = map.get(family) ?? { family, source: "document.fonts", weights: [], usageCount: 1 };
    if (!cur.weights.includes(f.weight)) cur.weights.push(f.weight);
    map.set(family, cur);
  }
  return [...map.values()]
    .sort((a, b) => b.usageCount - a.usageCount)
    .slice(0, 8)
    .map((f) => ({ ...f, weights: f.weights.sort((a, b) => a - b) }));
}

function firstFamily(stack: string): string {
  return (stack.split(",")[0] ?? "system-ui").replace(/["']/g, "").trim();
}

function round(n: number): number {
  return Math.round(n * 10) / 10;
}
