"use client";

import { Copy, Download, FileText, Wand2 } from "lucide-react";
import { downloadText } from "@/lib/client";
import { Button } from "@/components/ui";
import { useState } from "react";

export default function PromptPanel({
  prompt,
  onGenerate,
  loading,
}: {
  prompt?: string;
  onGenerate: () => void;
  loading: boolean;
}) {
  const [copied, setCopied] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button onClick={onGenerate} loading={loading}>
          <Wand2 size={15} />
          Generate design prompt
        </Button>
        <div className="grow" />
        <Button
          variant="outline"
          disabled={!prompt}
          onClick={() => {
            void navigator.clipboard.writeText(prompt ?? "");
            setCopied(true);
            setTimeout(() => setCopied(false), 1600);
          }}
        >
          <Copy size={15} />
          {copied ? "Copied" : "Copy Prompt"}
        </Button>
        <Button
          variant="outline"
          disabled={!prompt}
          onClick={() => prompt && downloadText(prompt, "DESIGN-PROMPT.md", "text/markdown")}
        >
          <Download size={15} />
          DESIGN-PROMPT.md
        </Button>
      </div>

      {!prompt ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-line py-16 text-center">
          <FileText size={28} className="mb-2 text-muted" />
          <p className="text-sm text-muted">
            Generate a detailed prompt another AI can use to rebuild this website.
          </p>
        </div>
      ) : (
        <pre className="panel max-h-[70vh] overflow-auto p-5 font-mono text-[12.5px] leading-relaxed text-ink scroll-thin">
          {prompt}
        </pre>
      )}
    </div>
  );
}