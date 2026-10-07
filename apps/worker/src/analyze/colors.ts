import type { ColorToken } from "@nn/shared";
import type { RawPageData } from "../extract/types";
import {
  type Rgba,
  isDark,
  luminance,
  parseColor,
  rgbToHsl,
  toHex,
  toHslString,
  toRgbString,
} from "./color";

interface Acc {
  color: Rgba;
  weight: number;
  count: number;
}

const DEFAULT_BG = "#FFFFFF";
const DEFAULT_TEXT = "#111827";

export function analyzeColors(raw: RawPageData): ColorToken[] {
  const backgrounds = new Map<string, Acc>();
  const texts = new Map<string, Acc>();
  const borders = new Map<string, Acc>();

  const bodyBg = parseColor(raw.bodyBg);
  const bodyText = parseColor(raw.bodyColor);

  if (bodyBg && bodyBg.a > 0.2) addTo(backgrounds, bodyBg, 5000);
  if (bodyText) addTo(texts, bodyText, 4000);

  for (const el of raw.elements) {
    const bg = parseColor(el.backgroundColor);
    if (bg && bg.a > 0.5) addTo(backgrounds, bg, Math.max(1, el.rect.width * el.rect.height) / 1000);

    if (el.text) {
      const fg = parseColor(el.color);
      if (fg && fg.a > 0.2) addTo(texts, fg, el.text.length + 1);
    }

    if (el.borderWidth > 0) {
      const bc = parseColor(el.borderColor);
      if (bc && bc.a > 0.2) addTo(borders, bc, 1);
    }
  }

  const bgList = rank(backgrounds);
  const textList = rank(texts);

  const background = bgList[0]?.color ?? hexToRgba(DEFAULT_BG);
  const dark = isDark(background);
  const text = pickContrasting(textList, background, dark) ?? hexToRgba(DEFAULT_TEXT);

  const used = new Set<string>([key(background), key(text)]);
  const saturated = [...bgList, ...textList]
    .filter((a) => {
      const s = rgbToHsl(a.color).s;
      return s >= 25 && !used.has(key(a.color));
    })
    .sort((a, b) => b.weight * (rgbToHsl(b.color).s / 100) - a.weight * (rgbToHsl(a.color).s / 100));

  const primary = saturated[0]?.color ?? mix(background, text, 0.5);
  used.add(key(primary));
  const secondary = saturated[1]?.color ?? mix(background, primary, 0.6);
  used.add(key(secondary));
  const accent = saturated[2]?.color ?? mix(primary, background, 0.35);
  used.add(key(accent));

  const neutrals = bgList.filter((a) => !used.has(key(a.color)));
  const surface = neutrals.find((a) => distance(a.color, background) > 8)?.color ?? step(background, dark ? 0.06 : -0.04);
  const card = neutrals.find((a) => distance(a.color, surface) > 8)?.color ?? surface;

  const muted = pickMuted(textList, background) ?? mix(text, background, 0.45);
  const border =
    borders.size > 0
      ? rank(borders)[0].color
      : mix(background, text, dark ? 0.18 : 0.12);

  const total = bgList.reduce((s, a) => s + a.weight, 0) + textList.reduce((s, a) => s + a.weight, 0);

  const tokens: [string, Rgba, number][] = [
    ["primary", primary, primaryWeight(saturated[0])],
    ["secondary", secondary, 200],
    ["accent", accent, 150],
    ["background", background, bgWeight(bgList[0])],
    ["surface", surface, 800],
    ["card", card, 600],
    ["text", text, textWeight(textList)],
    ["muted", muted, 400],
    ["border", border, borders.size > 0 ? 300 : 250],
    ["success", hexToRgba("#16A34A"), 20],
    ["warning", hexToRgba("#D97706"), 20],
    ["error", hexToRgba("#DC2626"), 20],
  ];

  return tokens.map(([role, color, weight]) => toToken(role, color, weight, total));
}

function toToken(role: string, color: Rgba, weight: number, total: number): ColorToken {
  return {
    role,
    hex: toHex(color),
    rgb: toRgbString(color),
    hsl: toHslString(color),
    usageCount: Math.round(weight),
    frequency: total > 0 ? Math.min(1, weight / total) : 0,
  };
}

function addTo(map: Map<string, Acc>, color: Rgba, weight: number): void {
  const k = key(color);
  const cur = map.get(k);
  if (cur) {
    cur.weight += weight;
    cur.count += 1;
  } else {
    map.set(k, { color, weight, count: 1 });
  }
}

function rank(map: Map<string, Acc>): Acc[] {
  return [...map.values()].sort((a, b) => b.weight - a.weight);
}

function pickContrasting(list: Acc[], bg: Rgba, dark: boolean): Rgba | null {
  for (const a of list) {
    const d = Math.abs(luminance(a.color) - luminance(bg));
    if (d > 0.25) return a.color;
  }
  void dark;
  return list[0]?.color ?? null;
}

function pickMuted(list: Acc[], bg: Rgba): Rgba | null {
  const candidates = list.filter((a) => {
    const d = Math.abs(luminance(a.color) - luminance(bg));
    return d > 0.08 && d < 0.5;
  });
  return candidates.sort((a, b) => b.weight - a.weight)[0]?.color ?? null;
}

function key(c: Rgba): string {
  return `${Math.round(c.r / 8)}-${Math.round(c.g / 8)}-${Math.round(c.b / 8)}`;
}

function distance(a: Rgba, b: Rgba): number {
  return Math.abs(a.r - b.r) + Math.abs(a.g - b.g) + Math.abs(a.b - b.b);
}

function mix(a: Rgba, b: Rgba, t: number): Rgba {
  return {
    r: Math.round(a.r + (b.r - a.r) * t),
    g: Math.round(a.g + (b.g - a.g) * t),
    b: Math.round(a.b + (b.b - a.b) * t),
    a: 1,
  };
}

function step(c: Rgba, amount: number): Rgba {
  const shift = amount * 255;
  return {
    r: clamp(c.r + shift),
    g: clamp(c.g + shift),
    b: clamp(c.b + shift),
    a: 1,
  };
}

function clamp(n: number): number {
  return Math.max(0, Math.min(255, Math.round(n)));
}

function hexToRgba(hex: string): Rgba {
  const c = parseColor(hex) ?? { r: 255, g: 255, b: 255, a: 1 };
  return c;
}

function primaryWeight(a: Acc | undefined): number {
  return a ? Math.round(a.weight) : 300;
}
function bgWeight(a: Acc | undefined): number {
  return a ? Math.round(a.weight) : 1000;
}
function textWeight(list: Acc[]): number {
  return list[0] ? Math.round(list[0].weight) : 800;
}
