import type { DesignSpec, Framework, GeneratedProject, ScanReport } from "@nn/shared";
import { generateNextjs } from "./nextjs";
import { generateReact } from "./react";
import { generateHtml } from "./html";

export * from "./derive";
export * from "./tokens";
export { generateNextjs, generateReact, generateHtml };

export function generateProject(
  framework: Framework,
  spec: DesignSpec,
  report: ScanReport,
): GeneratedProject {
  switch (framework) {
    case "nextjs":
      return generateNextjs(spec, report);
    case "react":
      return generateReact(spec, report);
    case "html":
      return generateHtml(spec, report);
    default:
      return generateNextjs(spec, report);
  }
}

export const FRAMEWORKS: { id: Framework; label: string }[] = [
  { id: "nextjs", label: "Next.js + TypeScript + Tailwind" },
  { id: "react", label: "React + TypeScript + Tailwind" },
  { id: "html", label: "HTML + CSS + JavaScript" },
];
