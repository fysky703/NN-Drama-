import type { ColorToken, DesignSpec } from "@nn/shared";

const ROLE_VARS: [string, string][] = [
  ["primary", "--color-primary"],
  ["secondary", "--color-secondary"],
  ["background", "--color-background"],
  ["surface", "--color-surface"],
  ["card", "--color-card"],
  ["text", "--color-text"],
  ["muted", "--color-muted"],
  ["border", "--color-border"],
  ["accent", "--color-accent"],
  ["success", "--color-success"],
  ["warning", "--color-warning"],
  ["error", "--color-error"],
];

const DEFAULT_SPACING = [4, 8, 12, 16, 24, 32, 48, 64, 96];

export function cssVariables(spec: DesignSpec): string {
  const lines: string[] = [];
  for (const [role, varName] of ROLE_VARS) {
    const token = spec.colors.find((c) => c.role === role);
    if (token) lines.push(`  ${varName}: ${token.hex};`);
  }

  const spacing = spec.spacing.length
    ? spec.spacing.slice(0, 12)
    : DEFAULT_SPACING.map((value) => ({ value, unit: "px", count: 0 }));
  spacing.forEach((s, i) => {
    lines.push(`  --space-${i + 1}: ${s.value}${s.unit};`);
  });

  lines.push(`  --radius-sm: 6px;`);
  lines.push(`  --radius-md: 12px;`);
  lines.push(`  --radius-lg: 20px;`);
  lines.push(`  --container: ${spec.layout.maxContentWidth || 1200}px;`);

  return lines.join("\n");
}

export function tailwindColorEntries(spec: DesignSpec): string {
  return ROLE_VARS.filter(([role]) => spec.colors.some((c) => c.role === role))
    .map(([role, varName]) => `          ${role}: "var(${varName})",`)
    .join("\n");
}

export function pickColor(spec: DesignSpec, role: string, fallback: string): string {
  return spec.colors.find((c) => c.role === role)?.hex ?? fallback;
}

export function topColors(colors: ColorToken[], n: number): ColorToken[] {
  return [...colors].sort((a, b) => b.frequency - a.frequency).slice(0, n);
}
