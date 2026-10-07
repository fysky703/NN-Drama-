import type { Metadata } from "next";
import { serverEnv } from "@/lib/env";
import { Badge } from "@/components/ui";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  const config: [string, string, boolean][] = [
    ["Storage", serverEnv.storeDriver, serverEnv.storeDriver === "prisma"],
    ["Object storage", serverEnv.storageDriver, serverEnv.storageDriver === "s3"],
    ["Queue", serverEnv.queueDriver, serverEnv.queueDriver === "redis"],
    ["AI provider", serverEnv.ai.provider, serverEnv.ai.provider !== "none"],
    ["Worker URL", serverEnv.workerUrl, true],
  ];

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
      <p className="mt-2 text-sm text-muted">
        Runtime configuration comes from environment variables. Nothing is
        hardcoded — set values in <span className="font-mono text-xs">.env</span>.
      </p>

      <section className="mt-8">
        <h2 className="mb-3 text-sm font-semibold">Active configuration</h2>
        <div className="panel overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line text-xs text-muted">
              <tr>
                <th className="px-4 py-2 font-medium">Setting</th>
                <th className="px-4 py-2 font-medium">Value</th>
                <th className="px-4 py-2 font-medium">Production</th>
              </tr>
            </thead>
            <tbody>
              {config.map(([label, value, production]) => (
                <tr key={label} className="border-b border-line/50 last:border-0">
                  <td className="px-4 py-2.5 text-ink">{label}</td>
                  <td className="px-4 py-2.5 font-mono text-xs text-muted">{value}</td>
                  <td className="px-4 py-2.5">
                    <Badge tone={production ? "success" : "warn"}>
                      {production ? "configured" : "dev fallback"}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-sm font-semibold">Cost & usage limits</h2>
        <div className="panel grid grid-cols-2 gap-px overflow-hidden sm:grid-cols-3">
          {[
            ["Scans / hour", String(serverEnv.limits.scansPerHour)],
            ["Concurrent scans", String(serverEnv.limits.concurrentScans)],
            ["Screenshots / scan", String(serverEnv.limits.maxScreenshots)],
            ["AI requests / day", String(serverEnv.limits.maxAiRequestsPerDay)],
            ["Refine max iterations", String(serverEnv.limits.refineMaxIterations)],
            ["Navigation timeout", `${Math.round(serverEnv.limits.navigationTimeoutMs / 1000)}s`],
          ].map(([label, value]) => (
            <div key={label} className="bg-elevated px-4 py-3">
              <div className="text-[10px] uppercase tracking-wide text-muted">{label}</div>
              <div className="mt-0.5 text-sm font-semibold text-ink">{value}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-sm font-semibold">AI providers</h2>
        <p className="text-sm leading-relaxed text-muted">
          The app talks to AI through a provider abstraction. With no key set,
          the built-in offline analyser produces the design specification and
          prompt deterministically. Set an API key plus{" "}
          <span className="font-mono text-xs">AI_PROVIDER=openai|anthropic|gemini</span>{" "}
          to enable live AI generation and refinement.
        </p>
      </section>
    </main>
  );
}