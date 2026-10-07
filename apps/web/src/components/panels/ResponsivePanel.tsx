"use client";

import { ArrowDownWideNarrow, Grid3X3, PanelTopOpen, PhoneOff, LayoutList, MoveHorizontal } from "lucide-react";
import type { ComponentType } from "react";
import type { ResponsiveChange } from "@nn/shared";
import { cn } from "@/lib/utils";

type ResponsiveIcon = ComponentType<{ className?: string; size?: number }>;

const ICONS: Record<string, ResponsiveIcon> = {
  "font-scale": Type,
  "horizontal-overflow": MoveHorizontal,
  "hidden-elements": PhoneOff,
  "revealed-elements": PhoneOff,
  "grid-collapse": Grid3X3,
  "stacked-layout": PanelTopOpen,
  "stable-layout": ArrowDownWideNarrow,
};

function Type({ className }: { className?: string }) {
  return <span className={className}>T</span>;
}

const LABELS: Record<string, string> = {
  desktop: "Desktop 1440px",
  tablet: "Tablet 768px",
  mobile: "Mobile 390px",
};

export default function ResponsivePanel({ changes }: { changes: ResponsiveChange[] }) {
  if (changes.length === 0) {
    return <p className="text-sm text-muted">No responsive data captured.</p>;
  }

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {changes.map((change, i) => {
        const Icon = ICONS[change.kind] ?? LayoutList;
        return (
          <div key={i} className="panel flex items-start gap-3 px-4 py-3">
            <span
              className={cn(
                "grid h-9 w-9 shrink-0 place-items-center rounded-lg",
                change.kind.includes("overflow")
                  ? "bg-rose/10 text-rose"
                  : "bg-brand-soft text-brand",
              )}
            >
              <Icon size={16} />
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium capitalize text-ink">
                  {change.kind.replace(/-/g, " ")}
                </span>
                <span className="rounded-full border border-line px-2 py-0.5 text-[10px] text-muted">
                  {LABELS[change.viewport] ?? change.viewport}
                </span>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-muted">{change.detail}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}