import { Suspense } from "react";
import type { Metadata } from "next";
import Dashboard from "@/components/Dashboard";

export const metadata: Metadata = { title: "Scan" };

export default async function ScanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <Suspense
      fallback={
        <div className="p-10 text-center text-sm text-muted">Loading…</div>
      }
    >
      <Dashboard scanId={id} />
    </Suspense>
  );
}