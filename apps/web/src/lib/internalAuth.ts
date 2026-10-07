import { NextRequest } from "next/server";
import { serverEnv } from "./env";

export function isTrustedWorker(req: NextRequest): boolean {
  return req.headers.get("x-worker-secret") === serverEnv.workerSecret;
}