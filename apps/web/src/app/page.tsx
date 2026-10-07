import { APP_TAGLINE } from "@/lib/constants";
import ScanForm from "@/components/ScanForm";
import { OUTPUT_FORMATS } from "@/lib/constants";
import { Check } from "lucide-react";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-6xl px-4">
      <section className="pt-16 pb-10 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-line bg-panel px-3 py-1 text-xs text-muted">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald" />
          AI Website Scanner · Analyzer · Code Generator
        </div>
        <h1 className="mx-auto max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
          Turn any public webpage{" "}
          <span className="bg-gradient-to-r from-brand to-emerald bg-clip-text text-transparent">
            into editable code
          </span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-muted">{APP_TAGLINE}</p>
      </section>

      <section className="pb-16">
        <ScanForm />
      </section>

      <section className="pb-16">
        <h2 className="mb-4 text-center text-xs font-semibold uppercase tracking-widest text-muted">
          Output formats
        </h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {OUTPUT_FORMATS.map((format) => (
            <div
              key={format}
              className="panel flex items-start gap-2 px-4 py-3 text-sm text-ink"
            >
              <Check size={16} className="mt-0.5 shrink-0 text-emerald" />
              {format}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}