"use client";

import { useState } from "react";
import { Columns2, Layers, Wand2, GitCompareArrows } from "lucide-react";
import type { ComparisonResult } from "@nn/shared";
import { cn, scoreColor } from "@/lib/utils";
import { Button, Progress, Badge } from "@/components/ui";

const MODES = [
  { id: "side-by-side", label: "Side-by-side", icon: Columns2 },
  { id: "overlay", label: "Overlay", icon: Layers },
  { id: "difference", label: "Difference", icon: GitCompareArrows },
] as const;

export default function ComparePanel({
  scanId,
  comparison,
  onCompare,
  onRefine,
  comparing,
  refining,
}: {
  scanId: string;
  comparison?: ComparisonResult;
  onCompare: () => void;
  onRefine: (target: number) => void;
  comparing: boolean;
  refining: boolean;
}) {
  const [mode, setMode] = useState<(typeof MODES)[number]["id"]>("side-by-side");
  const [opacity, setOpacity] = useState(50);
  const [target, setTarget] = useState(90);

  const scores = comparison?.scores;
  const previewUrl = `/preview/${scanId}`;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button onClick={onCompare} loading={comparing}>
          <GitCompareArrows size={15} />
          Compare with original
        </Button>
        <div className="hidden items-center gap-1 sm:flex">
          {MODES.map((m) => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={cn(
                "flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs transition",
                mode === m.id
                  ? "border-brand/50 bg-brand-soft text-ink"
                  : "border-line text-muted hover:bg-elevated",
              )}
            >
              <m.icon size={13} />
              {m.label}
            </button>
          ))}
        </div>
        <div className="grow" />
        <div className="flex items-center gap-2">
          <label className="text-xs text-muted">Target</label>
          <input
            type="number"
            min={0}
            max={100}
            value={target}
            onChange={(e) => setTarget(Number(e.target.value))}
            className="input w-16 px-2 py-1 text-center text-xs"
          />
          <Button variant="primary" onClick={() => onRefine(target)} loading={refining}>
            <Wand2 size={15} />
            Improve similarity
          </Button>
        </div>
      </div>

      {!comparison && !comparing ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-line py-20 text-center">
          <GitCompareArrows size={30} className="mb-2 text-muted" />
          <p className="text-sm text-muted">
            Compare the generated website against the original screenshots.
          </p>
        </div>
      ) : (
        <>
          {scores && (
            <div className="panel p-4">
              <div className="mb-4 flex items-center gap-4">
                <div className="grid h-20 w-20 place-items-center rounded-full border-4 border-brand/30">
                  <div className={cn("text-2xl font-bold", scoreColor(scores.overall))}>
                    {Math.round(scores.overall)}%
                  </div>
                </div>
                <div>
                  <div className="text-sm font-semibold text-ink">Visual similarity</div>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted">
                    <Badge tone={comparison.method === "measured" ? "success" : "neutral"}>
                      {comparison.method === "measured" ? "measured" : "estimated"}
                    </Badge>
                    <span>Layout & colors from real pixel comparison.</span>
                  </div>
                  {comparison.notes?.map((n, i) => (
                    <div key={i} className="mt-1 text-[11px] text-muted">
                      · {n}
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {(
                  [
                    ["Layout", scores.layout],
                    ["Colors", scores.colors],
                    ["Typography", scores.typography],
                    ["Spacing", scores.spacing],
                    ["Components", scores.components],
                    ["Responsive", scores.responsive],
                  ] as const
                ).map(([label, value]) => (
                  <div key={label}>
                    <div className="mb-1 flex justify-between text-xs">
                      <span className="text-muted">{label}</span>
                      <span className={cn("font-medium", scoreColor(value))}>{Math.round(value)}%</span>
                    </div>
                    <Progress value={value} />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="panel overflow-hidden">
            <div className="flex items-center justify-between border-b border-line px-3 py-2">
              <span className="text-xs font-medium text-muted">
                Original vs generated — {mode.replace("-", " ")}
              </span>
              {mode === "overlay" && (
                <div className="flex items-center gap-2 text-xs text-muted">
                  Original
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={opacity}
                    onChange={(e) => setOpacity(Number(e.target.value))}
                    className="w-28 accent-[var(--brand)]"
                  />
                  Generated
                </div>
              )}
            </div>

            {mode === "side-by-side" && (
              <div className="grid h-[520px] grid-cols-1 gap-px bg-line md:grid-cols-2">
                <div className="overflow-auto bg-bg scroll-thin">
                  <div className="sticky top-0 z-10 bg-elevated px-3 py-1 text-[11px] uppercase tracking-wide text-muted">
                    Original
                  </div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={comparison?.baseScreenshot} alt="Original" className="w-full" />
                </div>
                <div className="overflow-auto bg-white scroll-thin">
                  <div className="sticky top-0 z-10 bg-elevated px-3 py-1 text-[11px] uppercase tracking-wide text-muted">
                    Generated
                  </div>
                  <iframe src={previewUrl} title="Generated preview" className="h-full w-full" />
                </div>
              </div>
            )}

            {mode === "overlay" && (
              <div className="relative h-[520px] overflow-hidden bg-white">
                <iframe src={previewUrl} title="Generated" className="absolute inset-0 h-full w-full" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={comparison?.baseScreenshot}
                  alt="Original overlay"
                  className="pointer-events-none absolute inset-0 h-full w-full object-top"
                  style={{ opacity: opacity / 100 }}
                />
              </div>
            )}

            {mode === "difference" && (
              <div className="relative h-[520px] overflow-hidden bg-white">
                <iframe src={previewUrl} title="Generated" className="absolute inset-0 h-full w-full" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={comparison?.baseScreenshot}
                  alt="Difference"
                  className="pointer-events-none absolute inset-0 h-full w-full object-top mix-blend-difference opacity-90"
                />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}