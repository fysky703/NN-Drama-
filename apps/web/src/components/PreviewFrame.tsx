"use client";

import { useState } from "react";
import { Monitor, RefreshCw, Smartphone, Tablet, ExternalLink, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";

const SIZES = [
  { id: "desktop", label: "Desktop", width: 1440, icon: Monitor },
  { id: "tablet", label: "Tablet", width: 768, icon: Tablet },
  { id: "mobile", label: "Mobile", width: 390, icon: Smartphone },
] as const;

/** Responsive iframe preview of a generated project, with viewport controls. */
export default function PreviewFrame({
  src,
  title = "Preview",
  height = 480,
  onLoad,
}: {
  src: string;
  title?: string;
  height?: number;
  onLoad?: () => void;
}) {
  const [device, setDevice] = useState<(typeof SIZES)[number]["id"]>("desktop");
  const [nonce, setNonce] = useState(0);
  const [scale, setScale] = useState(1);
  const current = SIZES.find((s) => s.id === device)!;

  return (
    <div className="panel flex h-full flex-col overflow-hidden">
      <div className="flex flex-wrap items-center gap-2 border-b border-line px-3 py-2">
        <span className="text-xs font-medium text-muted">{title}</span>
        <div className="ml-auto flex items-center gap-1">
          {SIZES.map((s) => (
            <button
              key={s.id}
              onClick={() => setDevice(s.id)}
              title={s.label}
              className={cn(
                "grid h-7 w-8 place-items-center rounded-md transition",
                device === s.id
                  ? "bg-elevated text-ink ring-1 ring-line"
                  : "text-muted hover:bg-elevated",
              )}
            >
              <s.icon size={14} />
            </button>
          ))}
          <div className="mx-1 h-4 w-px bg-line" />
          {[1, 0.75, 0.5].map((s) => (
            <button
              key={s}
              onClick={() => setScale(s)}
              className={cn(
                "rounded px-1.5 py-0.5 font-mono text-[11px] transition",
                scale === s ? "bg-brand text-white" : "text-muted hover:bg-elevated",
              )}
            >
              {Math.round(s * 100)}%
            </button>
          ))}
          <div className="mx-1 h-4 w-px bg-line" />
          <button
            onClick={() => setNonce((n) => n + 1)}
            title="Refresh"
            className="grid h-7 w-8 place-items-center rounded-md text-muted transition hover:bg-elevated"
          >
            <RefreshCw size={14} />
          </button>
          <button
            onClick={() => window.open(src, "_blank")}
            title="Open in new tab"
            className="grid h-7 w-8 place-items-center rounded-md text-muted transition hover:bg-elevated"
          >
            <ExternalLink size={14} />
          </button>
          <button
            onClick={() => {
              window.open(src, "_blank");
            }}
            title="Fullscreen"
            className="grid h-7 w-8 place-items-center rounded-md text-muted transition hover:bg-elevated"
          >
            <Maximize2 size={14} />
          </button>
        </div>
      </div>

      <div className="flex flex-1 items-start justify-center overflow-auto bg-bg p-4 scroll-thin">
        <div
          className="origin-top transition-all"
          style={{
            width: current.width,
            maxWidth: "100%",
            transform: device === "desktop" ? `scale(${scale})` : undefined,
            transformOrigin: "top center",
          }}
        >
          <iframe
            key={`${device}-${nonce}`}
            src={src}
            title={title}
            onLoad={onLoad}
            sandbox="allow-scripts allow-same-origin allow-forms"
            className="h-[560px] w-full rounded-lg border border-line bg-white"
            style={{ height }}
          />
        </div>
      </div>
    </div>
  );
}