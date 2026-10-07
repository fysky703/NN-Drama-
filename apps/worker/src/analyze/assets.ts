import type { AssetItem } from "@nn/shared";
import type { RawPageData } from "../extract/types";

export function analyzeAssets(raw: RawPageData): AssetItem[] {
  const assets: AssetItem[] = [];

  raw.images.forEach((img, i) => {
    const isLogo =
      /logo|brand/i.test(img.src) || /logo|brand/i.test(img.alt) || (img.width < 260 && img.height < 90 && img.height > 0);
    assets.push({
      id: `img-${i}`,
      type: isLogo ? "logo" : "image",
      url: img.src,
      alt: img.alt,
      format: img.format || ext(img.src),
      width: img.width,
      height: img.height,
      location: "inline",
      usage: img.alt ? `Image: ${img.alt}` : "Content image",
    });
  });

  if (raw.svgCount > 0) {
    assets.push({
      id: "svg-inline",
      type: "icon",
      url: "",
      format: "svg",
      location: "inline",
      usage: `${raw.svgCount} inline SVG icon(s) detected`,
    });
  }

  for (const f of raw.fonts) {
    assets.push({
      id: `font-${f.family}-${f.weight}`,
      type: "font",
      url: "",
      format: "font",
      location: f.source,
      usage: `${f.family} ${f.weight}`,
    });
  }

  for (const href of raw.stylesheetUrls) {
    if (/fonts\.googleapis|\.woff2?|font/i.test(href)) {
      assets.push({
        id: `uploaded-font-${assets.length}`,
        type: "font",
        url: href,
        format: "css",
        location: "stylesheet",
        usage: "Web font stylesheet",
      });
    }
  }

  return dedupe(assets);
}

function ext(url: string): string {
  const clean = url.split("?")[0].split("#")[0];
  const parts = clean.split(".");
  return parts.length > 1 ? (parts.pop() ?? "").toLowerCase() : "";
}

function dedupe(list: AssetItem[]): AssetItem[] {
  const seen = new Set<string>();
  const out: AssetItem[] = [];
  for (const a of list) {
    const k = a.type + "|" + a.url + "|" + a.usage;
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(a);
  }
  return out;
}
