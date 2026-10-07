import type { DesignSpec, Framework, ScanReport } from "@nn/shared";

const FRAMEWORK_LABEL: Record<Framework, string> = {
  nextjs: "Next.js (App Router) + TypeScript + Tailwind CSS",
  react: "React + TypeScript + Tailwind CSS",
  html: "HTML + CSS + vanilla JavaScript",
};

/**
 * Build a highly detailed, model-agnostic reconstruction prompt.
 * Exported as DESIGN-PROMPT.md. Deterministic and offline.
 */
export function buildPrompt(
  report: ScanReport,
  spec: DesignSpec,
  framework: Framework = "nextjs",
): string {
  const c = spec.colors;
  const color = (role: string) => c.find((x) => x.role === role)?.hex ?? "—";
  const lines: string[] = [];

  lines.push(`# Website Reconstruction Prompt`);
  lines.push("");
  lines.push(`You are a senior frontend engineer. Rebuild the website described below as a`);
  lines.push(`production-ready **${FRAMEWORK_LABEL[framework]}** project. Use ONLY the design`);
  lines.push(`system and structure described here. Do not copy any proprietary code, logos,`);
  lines.push(`trademarks or copyrighted assets. Replace imagery with neutral placeholders.`);
  lines.push("");
  lines.push(`Source analysed: ${spec.url}`);
  lines.push(`Page title: ${spec.title}`);
  lines.push("");

  lines.push(`## 1. Project requirements`);
  lines.push(`- Output: ${FRAMEWORK_LABEL[framework]}.`);
  lines.push(`- Fully responsive (desktop / tablet / mobile).`);
  lines.push(`- Semantic, accessible HTML (WCAG AA contrast where possible).`);
  lines.push(`- Type-safe, modular components. No duplicated logic.`);
  lines.push(`- CSS variables / design tokens for colors, spacing, radius and typography.`);
  lines.push("");

  lines.push(`## 2. Design system`);
  lines.push(`### Colors`);
  for (const token of c) {
    lines.push(`- ${token.role}: ${token.hex} (${token.rgb}, ${token.hsl}) — used ${Math.round(token.frequency * 100)}%`);
  }
  lines.push("");
  lines.push(`### Typography`);
  for (const t of spec.typography) {
    lines.push(
      `- ${t.role}: font-family ${t.fontFamily}; font-size ${t.fontSize}px; weight ${t.fontWeight}; line-height ${t.lineHeight}; letter-spacing ${t.letterSpacing}`,
    );
  }
  lines.push("");
  lines.push(`### Spacing scale`);
  lines.push(`- ${spec.spacing.map((s) => `${s.value}${s.unit}`).join(", ") || "4, 8, 12, 16, 24, 32, 48, 64, 96"}px`);
  lines.push("");
  lines.push(`### Radius`);
  lines.push(`- ${spec.layout ? (report.designSystem.radius.join("px, ") + "px") : "—"}`);
  lines.push(`### Shadows`);
  lines.push(`- ${report.designSystem.shadows.join(" | ") || "none detected"}`);
  lines.push("");

  lines.push(`## 3. Layout`);
  lines.push(`- Max content width: ${spec.layout.maxContentWidth}px`);
  lines.push(`- Grid columns: ${spec.layout.gridColumns}`);
  lines.push(`- Flex sections: ${spec.layout.usesFlex}; Grid sections: ${spec.layout.usesGrid}; Sticky: ${spec.layout.usesSticky}`);
  lines.push(`- Alignment: ${spec.layout.alignment}`);
  lines.push("");

  lines.push(`## 4. Component hierarchy`);
  lines.push("```");
  lines.push(renderTree(report.components));
  lines.push("```");
  lines.push("");

  lines.push(`## 5. Page structure`);
  for (const h of report.page.headings) {
    lines.push(`${"#".repeat(Math.min(h.level + 2, 6))} ${h.text}`);
  }
  lines.push("");
  lines.push(`- Links: ${report.page.links}; Forms: ${report.page.forms}; Images: ${report.page.images}; Sections: ${report.page.sections}`);
  lines.push("");

  lines.push(`## 6. Responsive behavior`);
  if (spec.responsive.length === 0) {
    lines.push(`- Layout adapts across desktop (1440px), tablet (768px) and mobile (390px).`);
  } else {
    for (const r of spec.responsive) {
      lines.push(`- [${r.viewport}] ${r.kind}: ${r.detail}`);
    }
  }
  lines.push("");

  lines.push(`## 7. Interaction behavior`);
  for (const i of spec.interactions.slice(0, 40)) {
    lines.push(`- ${i.type} (${i.selector}): states ${i.states.join(", ")}`);
  }
  lines.push("");

  lines.push(`## 8. Technical requirements`);
  lines.push(`- Provide the full folder structure and every component file.`);
  lines.push(`- Use ${color("primary")} as the primary accent and ${color("background")} as the page background.`);
  lines.push(`- Include package.json, README.md, tsconfig.json and tailwind config where relevant.`);
  lines.push(`- Do not embed secrets or API keys.`);
  lines.push("");

  return lines.join("\n");
}

function renderTree(node: ScanReport["components"], indent = ""): string {
  const head = `${indent}${node.type}${node.label && node.label !== node.type ? ` (${node.label})` : ""}`;
  const children = node.children.map((c) => renderTree(c, `${indent}  `));
  return [head, ...children].join("\n");
}
