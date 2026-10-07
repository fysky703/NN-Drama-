"use client";

import type { DesignSpec, ScanReport } from "@nn/shared";

function ColorSwatch({ hex }: { hex: string }) {
  return (
    <div className="flex items-center gap-3">
      <span
        className="h-11 w-11 shrink-0 rounded-lg border border-white/10 shadow-inner"
        style={{ background: hex }}
      />
      <div className="min-w-0">
        <div className="text-xs font-semibold text-ink">{hex}</div>
        <div className="font-mono text-[10px] text-muted">
          {hex.toLowerCase()}
        </div>
      </div>
    </div>
  );
}

export default function DesignPanel({
  spec,
  report,
}: {
  spec?: DesignSpec;
  report?: ScanReport;
}) {
  const colors = spec?.colors ?? report?.designSystem.colors ?? [];
  const typography = spec?.typography ?? report?.designSystem.typography ?? [];
  const spacing = report?.designSystem.spacing ?? [];
  const layout = report?.designSystem.layout;

  return (
    <div className="space-y-6">
      <section>
        <h3 className="mb-3 text-sm font-semibold">Colors</h3>
        {colors.length === 0 ? (
          <p className="text-sm text-muted">No colors extracted.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {colors.map((c) => (
              <div key={c.role} className="panel flex items-center justify-between gap-2 px-3 py-2.5">
                <div className="min-w-0">
                  <div className="text-xs font-medium capitalize text-ink">{c.role.replace(/_/g, " ")}</div>
                  <div className="mt-0.5 font-mono text-[10px] text-muted">{c.hex}</div>
                  <div className="font-mono text-[10px] text-muted/60">{c.hsl}</div>
                </div>
                <ColorSwatch hex={c.hex} />
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h3 className="mb-3 text-sm font-semibold">Typography scale</h3>
        <div className="panel overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line text-xs text-muted">
              <tr>
                <th className="px-4 py-2 font-medium">Role</th>
                <th className="px-4 py-2 font-medium">Family</th>
                <th className="px-4 py-2 font-medium">Size</th>
                <th className="px-4 py-2 font-medium">Weight</th>
                <th className="px-4 py-2 font-medium">Line-height</th>
              </tr>
            </thead>
            <tbody>
              {typography.map((t) => (
                <tr key={t.role} className="border-b border-line/50 last:border-0">
                  <td className="px-4 py-2 font-medium text-ink">{t.role}</td>
                  <td className="px-4 py-2 font-mono text-xs text-muted">{t.fontFamily}</td>
                  <td className="px-4 py-2 font-mono text-xs text-ink">{t.fontSize}px</td>
                  <td className="px-4 py-2 font-mono text-xs text-ink">{t.fontWeight}</td>
                  <td className="px-4 py-2 font-mono text-xs text-muted">{t.lineHeight}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h3 className="mb-3 text-sm font-semibold">Spacing scale</h3>
        {spacing.length === 0 ? (
          <p className="text-sm text-muted">No spacing extracted.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {spacing.map((s) => (
              <div
                key={`${s.value}${s.unit}`}
                className="panel flex flex-col items-center px-4 py-3 text-center"
              >
                <div className="text-sm font-semibold text-ink">
                  {s.value}
                  {s.unit}
                </div>
                <div className="mt-2 flex h-2 w-full items-end justify-center rounded-full bg-brand/20">
                  <div
                    className="w-2 rounded-full bg-brand"
                    style={{ height: Math.min(24, s.value / 3) }}
                  />
                </div>
                <div className="mt-1 text-[10px] text-muted">{s.count} uses</div>
              </div>
            ))}
          </div>
        )}
      </section>

      {layout && (
        <section>
          <h3 className="mb-3 text-sm font-semibold">Layout</h3>
          <div className="panel grid grid-cols-2 gap-px overflow-hidden sm:grid-cols-3">
            {[
              ["Max content width", `${layout.maxContentWidth}px`],
              ["Container", `${layout.containerWidth}px`],
              ["Grid columns", String(layout.gridColumns)],
              ["Flex layouts", String(layout.usesFlex)],
              ["Grid layouts", String(layout.usesGrid)],
              ["Sticky elements", String(layout.usesSticky)],
            ].map(([k, v]) => (
              <div key={k} className="bg-elevated px-4 py-3">
                <div className="text-[10px] uppercase tracking-wide text-muted">{k}</div>
                <div className="mt-0.5 text-sm font-semibold text-ink">{v}</div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}