"use client";

import { useState } from "react";
import { Maximize2, ZoomIn, ZoomOut } from "lucide-react";
import type { ScreenshotRef } from "@nn/shared";
import { cn } from "@/lib/utils";

export default function ScreenshotPanel({ screenshots }: { screenshots: ScreenshotRef[] }) {
  const [active, setActive] = useState(screenshots[0]?.viewport ?? "desktop");
  const [zoom, setZoom] = useState(1);
  const current = screenshots.find((s) => s.viewport === active) ?? screenshots[0];

  if (!current) {
    return <p className="text-sm text-muted">No screenshots captured.</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {(["desktop", "tablet", "mobile"] as const).map((v) => {
          const shot = screenshots.find((s) => s.viewport === v);
          return (
            <button
              key={v}
              onClick={() => {
                setActive(v);
                setZoom(1);
              }}
              disabled={!shot}
              className={cn(
                "rounded-lg border px-3 py-1.5 text-xs capitalize transition disabled:opacity-40",
                active === v
                  ? "border-brand/50 bg-brand-soft text-ink"
                  : "border-line text-muted hover:bg-elevated",
              )}
            >
              {v}
              {shot && <span className="ml-1.5 text-[10px] text-muted">{shot.width}×{shot.height}</span>}
            </button>
          );
        })}
        <div className="ml-auto flex items-center gap-1">
          <button
            onClick={() => setZoom((z) => Math.max(0.4, z - 0.2))}
            className="grid h-7 w-8 place-items-center rounded-md text-muted hover:bg-elevated"
          >
            <ZoomOut size={14} />
          </button>
          <span className="w-10 text-center font-mono text-xs text-muted">{Math.round(zoom * 100)}%</span>
          <button
            onClick={() => setZoom((z) => Math.min(4, z + 0.2))}
            className="grid h-7 w-8 place-items-center rounded-md text-muted hover:bg-elevated"
          >
            <ZoomIn size={14} />
          </button>
          <button
            onClick={() => window.open(current.url, "_blank")}
            className="grid h-7 w-8 place-items-center rounded-md text-muted hover:bg-elevated"
            title="Open full resolution"
          >
            <Maximize2 size={14} />
          </button>
        </div>
      </div>

      <div className="panel overflow-hidden">
        <div className="max-h-[720px] overflow-auto bg-bg p-4 scroll-thin">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={current.url}
            alt={`Original ${current.viewport} screenshot`}
            className="mx-auto rounded-lg border border-line transition-transform duration-200"
            style={{ width: "100%", transform: `scale(${zoom})`, transformOrigin: "top center" }}
            loading="lazy"
          />
        </div>
        <div className="border-t border-line px-4 py-2 text-xs text-muted">
          Captured {current.width}×{current.height} at {new Date(current.capturedAt).toLocaleString()}
        </div>
      </div>
    </div>
  );
}