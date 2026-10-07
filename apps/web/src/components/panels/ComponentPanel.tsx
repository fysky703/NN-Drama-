"use client";

import type { ComponentNode, DetectedComponent } from "@nn/shared";
import { Boxes, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui";

function Tree({ node, depth = 0 }: { node: ComponentNode; depth?: number }) {
  const hasChildren = node.children.length > 0;
  return (
    <div>
      <div
        className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-elevated"
        style={{ paddingLeft: `${8 + depth * 16}px` }}
      >
        <ChevronRight
          size={12}
          className={hasChildren ? "text-brand" : "text-transparent"}
        />
        <span className="text-sm text-ink">{node.type}</span>
        <span className="truncate text-xs text-muted">{node.label}</span>
        <Badge tone="neutral" className="ml-auto">
          {Math.round(node.confidence * 100)}%
        </Badge>
      </div>
      {hasChildren && (
        <div>
          {node.children.map((c) => (
            <Tree key={c.id} node={c} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ComponentPanel({
  list = [],
  tree,
}: {
  list: DetectedComponent[];
  tree?: ComponentNode;
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
          <Boxes size={15} className="text-brand" /> Detected components
        </h3>
        {list.length === 0 ? (
          <p className="text-sm text-muted">No components detected.</p>
        ) : (
          <div className="panel overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-line text-xs text-muted">
                <tr>
                  <th className="px-4 py-2 font-medium">Component</th>
                  <th className="px-4 py-2 font-medium">Count</th>
                  <th className="px-4 py-2 font-medium">Confidence</th>
                </tr>
              </thead>
              <tbody>
                {list.map((c) => (
                  <tr key={c.type} className="border-b border-line/50 last:border-0">
                    <td className="px-4 py-2 font-medium text-ink">{c.type}</td>
                    <td className="px-4 py-2 text-muted">{c.count}</td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-20 overflow-hidden rounded bg-elevated">
                          <div
                            className="h-full rounded bg-brand"
                            style={{ width: `${c.confidence * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted">{Math.round(c.confidence * 100)}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <h3 className="mb-3 text-sm font-semibold">Component tree</h3>
        {tree ? (
          <div className="panel p-2">
            <Tree node={tree} />
          </div>
        ) : (
          <p className="text-sm text-muted">Tree unavailable.</p>
        )}
      </section>
    </div>
  );
}