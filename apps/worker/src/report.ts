import type {
  DesignSystem,
  ScanReport,
  ScreenshotRef,
  ViewportName,
  ViewportSize,
} from "@nn/shared";
import type { RawPageData } from "./extract/types";
import { analyzeColors } from "./analyze/colors";
import { analyzeTypography } from "./analyze/typography";
import { analyzeRadius, analyzeShadows, analyzeSpacing } from "./analyze/spacing";
import { analyzeLayout } from "./analyze/layout";
import { analyzeComponents } from "./analyze/components";
import { analyzeAssets } from "./analyze/assets";
import { analyzeResponsive } from "./analyze/responsive";
import { analyzeInteractions } from "./analyze/interactions";

export interface BuildReportInput {
  url: string;
  finalUrl: string;
  rawByViewport: Partial<Record<ViewportName, RawPageData>>;
  screenshots: ScreenshotRef[];
  viewports: ViewportSize[];
  durationMs: number;
}

export function buildReport(input: BuildReportInput): ScanReport {
  const primary = input.rawByViewport.desktop ?? first(input.rawByViewport);
  if (!primary) {
    throw new Error("No page data was collected from any viewport.");
  }

  const { typography, fonts } = analyzeTypography(primary);
  const { list, tree } = analyzeComponents(primary);

  const designSystem: DesignSystem = {
    colors: analyzeColors(primary),
    typography,
    spacing: analyzeSpacing(primary),
    layout: analyzeLayout(primary),
    fonts,
    radius: analyzeRadius(primary),
    shadows: analyzeShadows(primary),
  };

  return {
    url: input.url,
    finalUrl: input.finalUrl,
    title: primary.title || input.finalUrl,
    description: primary.description || undefined,
    favicon: primary.favicon || undefined,
    language: primary.lang || undefined,
    designSystem,
    components: tree,
    componentList: list,
    assets: analyzeAssets(primary),
    screenshots: input.screenshots,
    responsive: analyzeResponsive(input.rawByViewport),
    interactions: analyzeInteractions(primary),
    page: {
      headings: primary.headings,
      links: primary.links.length,
      forms: primary.forms,
      images: primary.images.length,
      sections: primary.landmarks.filter((l) => l.tag === "section").length,
    },
    meta: {
      scannedAt: new Date().toISOString(),
      durationMs: input.durationMs,
      viewports: input.viewports,
      htmlBytes: primary.htmlBytes,
    },
  };
}

function first(
  raw: Partial<Record<ViewportName, RawPageData>>,
): RawPageData | undefined {
  return raw.desktop ?? raw.tablet ?? raw.mobile;
}
