import type { DesignSpec, ScanReport } from "@nn/shared";

export interface SiteNavLink {
  label: string;
  href: string;
}

export interface SiteSection {
  id: string;
  kind: "features" | "pricing" | "testimonials" | "stats" | "cta" | "content";
  title: string;
  body: string;
  items: { title: string; body: string; badge?: string }[];
}

export interface SiteData {
  name: string;
  description: string;
  nav: SiteNavLink[];
  hero: {
    eyebrow: string;
    heading: string;
    sub: string;
    cta: string;
    secondaryCta: string;
  };
  sections: SiteSection[];
  footer: {
    tagline: string;
    columns: { title: string; links: string[] }[];
  };
}

const DEFAULT_NAV: SiteNavLink[] = [
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "Testimonials", href: "#testimonials" },
  { label: "Contact", href: "#contact" },
];

/**
 * Derive a concrete, componentised site structure from the scan. This is
 * deterministic and used by every code generator so output stays consistent.
 */
export function deriveSiteData(report: ScanReport, spec: DesignSpec): SiteData {
  const types = new Set(report.componentList.map((c) => c.type.toLowerCase()));
  const headings = report.page.headings;
  const h1 = headings.find((h) => h.level === 1)?.text;
  const h2s = headings.filter((h) => h.level === 2);
  const h3s = headings.filter((h) => h.level === 3);

  const name = deriveName(report);
  const sections: SiteSection[] = [];

  const featureCount = countComponents(types, ["feature card", "feature", "card"]);
  if (has(types, ["feature", "feature card", "card", "grid"]) || featureCount > 0) {
    sections.push({
      id: "features",
      kind: "features",
      title: h2s[0]?.text ?? "Everything you need",
      body: "A focused set of capabilities designed to help you move faster.",
      items: buildItems(Math.max(3, Math.min(6, featureCount || 3)), h3s, "Feature"),
    });
  }

  const stats = countComponents(types, ["stat", "stats"]);
  if (stats > 0 || has(types, ["stat"])) {
    sections.push({
      id: "stats",
      kind: "stats",
      title: h2s[1]?.text ?? "Trusted by teams",
      body: "Numbers that speak for themselves.",
      items: [
        { title: "99.9%", body: "Uptime" },
        { title: "10k+", body: "Users" },
        { title: "150+", body: "Countries" },
        { title: "24/7", body: "Support" },
      ],
    });
  }

  if (has(types, ["pricing", "pricing card", "price"])) {
    sections.push({
      id: "pricing",
      kind: "pricing",
      title: h2s[2]?.text ?? "Simple, transparent pricing",
      body: "Choose the plan that fits your team.",
      items: [
        { title: "Starter", body: "$0 / month", badge: "Free" },
        { title: "Pro", body: "$29 / month", badge: "Popular" },
        { title: "Enterprise", body: "Custom", badge: "Contact" },
      ],
    });
  }

  if (has(types, ["testimonial", "review", "quote"])) {
    sections.push({
      id: "testimonials",
      kind: "testimonials",
      title: h2s[3]?.text ?? "Loved by builders",
      body: "Here is what people are saying.",
      items: buildItems(3, h3s, "Testimonial"),
    });
  }

  sections.push({
    id: "contact",
    kind: "cta",
    title: "Ready to get started?",
    body: "Start building today — no credit card required.",
    items: [],
  });

  return {
    name,
    description:
      report.description ?? spec.visualStyle.hierarchy ?? "A modern web experience.",
    nav: DEFAULT_NAV,
    hero: {
      eyebrow: "Reconstructed from your design system",
      heading: h1 ?? "Build something people love",
      sub:
        report.description ??
        "A clean, responsive experience generated from the analysed design system.",
      cta: "Get started",
      secondaryCta: "Learn more",
    },
    sections,
    footer: {
      tagline: `${name} — rebuilt with a consistent design system.`,
      columns: [
        { title: "Product", links: ["Features", "Pricing", "Changelog"] },
        { title: "Company", links: ["About", "Blog", "Careers"] },
        { title: "Legal", links: ["Privacy", "Terms", "Licenses"] },
      ],
    },
  };
}

function buildItems(
  count: number,
  headings: { level: number; text: string }[],
  fallbackPrefix: string,
): { title: string; body: string }[] {
  const items: { title: string; body: string }[] = [];
  for (let i = 0; i < count; i++) {
    const h = headings[i];
    items.push({
      title: h?.text ?? `${fallbackPrefix} ${i + 1}`,
      body: "Replace this placeholder with the real content from your source page.",
    });
  }
  return items;
}

function has(types: Set<string>, keys: string[]): boolean {
  return keys.some((k) => types.has(k));
}

function countComponents(types: Set<string>, keys: string[]): number {
  return keys.reduce((acc, k) => acc + (types.has(k) ? 1 : 0), 0);
}

function deriveName(report: ScanReport): string {
  try {
    return new URL(report.finalUrl || report.url).hostname.replace(/^www\./, "");
  } catch {
    return report.title?.split(/[|\-–—]/)[0]?.trim() || "Your Site";
  }
}
