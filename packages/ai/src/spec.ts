import type { DesignSpec, ScanReport } from "@nn/shared";

/**
 * Build a structured design specification from a scan report.
 * This is fully programmatic — no AI required — so it works offline and is
 * cheap to run. AI (when configured) can enrich the narrative afterwards.
 */
export function buildDesignSpec(report: ScanReport): DesignSpec {
  const ds = report.designSystem;

  const dominantHeading = ds.typography.find((t) => t.role === "h1");
  const dominantBody = ds.typography.find((t) => t.role === "body");
  const sectionCount = report.page.sections;

  return {
    url: report.url,
    title: report.title,
    visualStyle: {
      style: inferStyle(report),
      mood: inferMood(ds.colors),
      hierarchy: dominantHeading && dominantBody
        ? `${dominantHeading.fontSize}px hero heading against ${dominantBody.fontSize}px body — ${ratioWord(dominantHeading.fontSize / Math.max(dominantBody.fontSize, 1))} contrast`
        : "Moderate hierarchy",
      density: sectionCount > 8 ? "Content-dense" : sectionCount > 4 ? "Balanced" : "Spacious",
      language: ds.fonts.map((f) => f.family).join(", ") || "System font stack",
    },
    colors: ds.colors,
    typography: ds.typography,
    spacing: ds.spacing,
    layout: ds.layout,
    components: report.componentList,
    responsive: report.responsive,
    interactions: report.interactions,
    content: report.page,
  };
}

function inferStyle(report: ScanReport): string {
  const radius = Math.max(0, ...report.designSystem.radius);
  const shadows = report.designSystem.shadows.length;
  const dark = (report.designSystem.colors.find((c) => c.role === "background")?.hex ?? "")
    .toLowerCase()
    .match(/^#(0|1|2|3)/);

  const corner = radius >= 16 ? "pill/rounded" : radius >= 6 ? "soft-rounded" : "sharp";
  const depth = shadows > 1 ? "elevated" : "flat";
  const theme = dark ? "dark" : "light";
  return `${theme}, ${corner}, ${depth} interface`;
}

function inferMood(colors: DesignSpec["colors"]): string {
  const primary = colors.find((c) => c.role === "primary");
  if (!primary) return "Neutral and professional";
  const hue = hslHue(primary.hsl);
  if (hue === null) return "Neutral and professional";
  if (hue < 20 || hue >= 330) return "Bold and energetic";
  if (hue < 45) return "Warm and friendly";
  if (hue < 160) return "Fresh and natural";
  if (hue < 250) return "Calm, trustworthy and technical";
  return "Creative and modern";
}

function hslHue(hsl: string): number | null {
  const m = hsl.match(/hsl\(\s*([\d.]+)/i);
  return m ? Number(m[1]) : null;
}

function ratioWord(ratio: number): string {
  if (ratio >= 3) return "strong";
  if (ratio >= 2) return "clear";
  return "subtle";
}
