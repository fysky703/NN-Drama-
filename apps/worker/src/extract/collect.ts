import type { RawElement, RawPageData } from "./types";

/**
 * Runs inside the browser context via page.evaluate(). It must be fully
 * self-contained (no references to module scope) because Playwright
 * serialises it into the page.
 */
export function collectPageData(): RawPageData {
  const MAX_ELEMENTS = 4000;

  function px(value: string): number {
    const n = parseFloat(value);
    return Number.isFinite(n) ? n : 0;
  }

  function sides(value: string): [number, number, number, number] {
    const parts = value.split(/\s+/).map(px);
    const [a = 0, b = a, c = a, d = b] = parts;
    return [a, b, c, d];
  }

  const all = Array.from(document.querySelectorAll<HTMLElement>("body *"));
  const elements: RawElement[] = [];

  const landmarks: RawPageData["landmarks"] = [];
  for (const el of Array.from(
    document.querySelectorAll<HTMLElement>("header,nav,main,section,footer,aside,article"),
  )) {
    const r = el.getBoundingClientRect();
    if (r.width > 0 && r.height > 0) {
      landmarks.push({
        tag: el.tagName.toLowerCase(),
        id: el.id,
        classes: Array.from(el.classList),
        rect: { x: r.x, y: r.y + window.scrollY, width: r.width, height: r.height },
      });
    }
  }

  for (const el of all) {
    if (elements.length >= MAX_ELEMENTS) break;
    const rect = el.getBoundingClientRect();
    if (rect.width < 4 || rect.height < 4) continue;

    const cs = getComputedStyle(el);
    const depth = (() => {
      let d = 0;
      let node: HTMLElement | null = el;
      while (node && node !== document.body) {
        d++;
        node = node.parentElement;
      }
      return d;
    })();

    const rawText = (el.textContent ?? "").replace(/\s+/g, " ").trim();

    elements.push({
      tag: el.tagName.toLowerCase(),
      role: el.getAttribute("role"),
      id: el.id,
      classes: Array.from(el.classList).slice(0, 12),
      text: rawText.slice(0, 160),
      rect: {
        x: Math.round(rect.x),
        y: Math.round(rect.y + window.scrollY),
        width: Math.round(rect.width),
        height: Math.round(rect.height),
      },
      fontSize: px(cs.fontSize),
      fontWeight: Number(cs.fontWeight) || 400,
      fontFamily: cs.fontFamily,
      lineHeight: cs.lineHeight,
      letterSpacing: cs.letterSpacing,
      color: cs.color,
      backgroundColor: cs.backgroundColor,
      padding: sides(cs.paddingTop + " " + cs.paddingRight + " " + cs.paddingBottom + " " + cs.paddingLeft),
      margin: sides(cs.marginTop + " " + cs.marginRight + " " + cs.marginBottom + " " + cs.marginLeft),
      borderRadius: cs.borderRadius,
      boxShadow: cs.boxShadow,
      borderColor: cs.borderTopColor,
      borderWidth: px(cs.borderTopWidth),
      display: cs.display,
      position: cs.position,
      depth,
    });
  }

  const headings = Array.from(document.querySelectorAll("h1,h2,h3,h4,h5,h6")).map((h) => ({
    level: Number(h.tagName[1]),
    text: (h.textContent ?? "").replace(/\s+/g, " ").trim().slice(0, 160),
  }));

  const links = Array.from(document.querySelectorAll<HTMLAnchorElement>("a[href]"))
    .slice(0, 500)
    .map((a) => ({ href: a.href, text: (a.textContent ?? "").trim().slice(0, 80) }));

  const buttons = Array.from(
    document.querySelectorAll<HTMLElement>("button,a[role=button],input[type=submit]"),
  )
    .slice(0, 200)
    .map((b) => ({ text: (b.textContent ?? "").trim().slice(0, 60), tag: b.tagName.toLowerCase() }));

  const images = Array.from(document.querySelectorAll<HTMLImageElement>("img"))
    .slice(0, 300)
    .map((img) => {
      const rect = img.getBoundingClientRect();
      const ext = (img.currentSrc || img.src).split("?")[0].split(".").pop() ?? "";
      return {
        src: img.currentSrc || img.src,
        alt: img.alt ?? "",
        width: Math.round(img.naturalWidth || rect.width),
        height: Math.round(img.naturalHeight || rect.height),
        format: ext.length <= 5 ? ext.toLowerCase() : "",
      };
    });

  const fonts: RawPageData["fonts"] = [];
  try {
    (document as unknown as { fonts?: { forEach: (cb: (f: { family: string; weight: string }) => void) => void } }).fonts?.forEach(
      (f) => {
        fonts.push({ family: f.family, weight: Number(f.weight) || 400, source: "document.fonts" });
      },
    );
  } catch {
    /* document.fonts unavailable */
  }

  const stylesheetUrls = Array.from(
    document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]'),
  ).map((l) => l.href);

  const csBody = getComputedStyle(document.body);

  const descEl = document.querySelector('meta[name="description"]');

  return {
    title: document.title,
    description: descEl?.getAttribute("content") ?? "",
    favicon:
      document.querySelector<HTMLLinkElement>('link[rel="icon"],link[rel="shortcut icon"]')?.href ??
      "",
    lang: document.documentElement.lang || "",
    headings,
    links,
    forms: document.querySelectorAll("form").length,
    buttons,
    images,
    svgCount: document.querySelectorAll("svg").length,
    landmarks,
    fonts,
    stylesheetUrls,
    elements,
    htmlBytes: new Blob([document.documentElement.outerHTML]).size,
    scrollHeight: document.documentElement.scrollHeight,
    scrollWidth: document.documentElement.scrollWidth,
    bodyBg: csBody.backgroundColor,
    bodyColor: csBody.color,
    viewport: { width: window.innerWidth, height: window.innerHeight },
  };
}
