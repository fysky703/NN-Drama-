"use client";

import type { ProgressStep } from "@nn/shared";
import { Check, Circle, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ScanProgress({ steps }: { steps: ProgressStep[] }) {
  const activeIndex = steps.findIndex((s) => s.state === "active");
  const doneCount = steps.filter((s) => s.state === "done").length;
  const pct = steps.length === 0 ? 0 : Math.round((doneCount / steps.length) * 100);

  return (
    <div className="panel overflow-hidden">
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <span className="text-sm font-medium">Scanning in progress</span>
        <span className="font-mono text-xs text-brand">{pct}%</span>
      </div>
      <div className="h-1 w-full bg-elevated">
        <div
          className="h-full bg-brand transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
      <ul className="max-h-[420px] space-y-0.5 overflow-y-auto p-3">
        {steps.map((step, i) => {
          const isActive = step.state === "active" || (step.state === "pending" && i === activeIndex);
          return (
            <li
              key={step.key}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition",
                isActive && "bg-elevated",
              )}
            >
              <span
                className={cn(
                  "grid h-5 w-5 shrink-0 place-items-center rounded-full",
                  step.state === "done" && "bg-emerald/15 text-emerald",
                  isActive && "bg-brand/15 text-brand",
                  step.state === "error" && "bg-rose/15 text-rose",
                  step.state === "pending" && "text-muted/50",
                )}
              >
                {step.state === "done" ? (
                  <Check size={12} />
                ) : step.state === "error" ? (
                  <X size={12} />
                ) : isActive ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <Circle size={10} />
                )}
              </span>
              <span
                className={cn(
                  step.state === "done" ? "text-ink" : isActive ? "text-ink" : "text-muted",
                )}
              >
                {step.label}
              </span>
              {step.detail && (
                <span className="ml-auto hidden truncate font-mono text-[11px] text-muted sm:block">
                  {step.detail}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}