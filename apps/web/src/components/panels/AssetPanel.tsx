"use client";

import type { AssetItem } from "@nn/shared";
import { FileImage, FileCode2, Link2, Palette } from "lucide-react";
import { Badge } from "@/components/ui";

const ICONS = {
  image: FileImage,
  svg: FileCode2,
  icon: Palette,
  logo: Link2,
  background: FileImage,
  video: FileImage,
  font: FileCode2,
} as const;

export default function AssetPanel({ assets }: { assets: AssetItem[] }) {
  if (assets.length === 0) {
    return <p className="text-sm text-muted">No assets detected.</p>;
  }

  return (
    <div>
      <p className="mb-4 max-w-2xl text-xs leading-relaxed text-muted">
        Asset inventory is informational. Respect source licenses — NN Drama does
        not redistribute protected assets. Use the URLs or upload your own.
      </p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {assets.slice(0, 120).map((asset, i) => {
          const Icon = ICONS[asset.type] ?? FileImage;
          return (
            <div key={`${asset.id}-${i}`} className="panel px-4 py-3">
              <div className="flex items-center gap-2">
                <Icon size={14} className="text-brand" />
                <Badge tone="brand">{asset.type}</Badge>
                {asset.format && <Badge tone="neutral">{asset.format}</Badge>}
              </div>
              {asset.url ? (
                <a
                  href={asset.url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 block truncate font-mono text-[11px] text-brand underline-offset-2 hover:underline"
                >
                  {asset.url}
                </a>
              ) : (
                <div className="mt-2 truncate font-mono text-[11px] text-muted">
                  inline / detected
                </div>
              )}
              {asset.width && asset.height ? (
                <div className="mt-1 text-[11px] text-muted">
                  {asset.width}×{asset.height}
                </div>
              ) : null}
              <div className="mt-1 truncate text-xs text-ink">{asset.usage}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}