import fsp from "node:fs/promises";
import path from "node:path";
import { nanoid } from "nanoid";
import { serverEnv } from "./env";

export interface StoredObject {
  url: string;
  storageKey: string;
}

export interface StorageAdapter {
  saveScreenshot(input: {
    scanId: string;
    viewport: string;
    buffer: Buffer;
  }): Promise<StoredObject>;
}

/** Writes screenshots into the web app's public/ so they are served by the same origin. */
export class LocalStorageAdapter implements StorageAdapter {
  async saveScreenshot(input: {
    scanId: string;
    viewport: string;
    buffer: Buffer;
  }): Promise<StoredObject> {
    const dir = path.join(process.cwd(), "public", "scans", input.scanId);
    await fsp.mkdir(dir, { recursive: true });
    const key = `${input.scanId}/${input.viewport}-${nanoid(8)}.png`;
    await fsp.writeFile(path.join(process.cwd(), "public", key), input.buffer);
    return { url: `/scans/${key}`, storageKey: key };
  }
}

/** S3 object storage. Requires the S3_* environment variables. */
export class S3StorageAdapter implements StorageAdapter {
  private readonly endpoint: string;
  private readonly bucket: string;

  constructor() {
    this.endpoint = serverEnv.s3.endpoint;
    this.bucket = serverEnv.s3.bucket;
  }

  async saveScreenshot(input: {
    scanId: string;
    viewport: string;
    buffer: Buffer;
  }): Promise<StoredObject> {
    if (!this.endpoint || !this.bucket) {
      throw new Error("S3 storage not configured. Set S3_ENDPOINT and S3_BUCKET.");
    }
    const key = `scans/${input.scanId}/${input.viewport}-${nanoid(8)}.png`;
    const url = `${this.endpoint.replace(/\/$/, "")}/${this.bucket}/${key}`;
    const res = await fetch(url, {
      method: "PUT",
      headers: {
        "content-type": "image/png",
        // NOTE: real deployments should use SigV4 signing via an SDK.
        // This placeholder is intentionally marked as NOT production-ready.
        authorization: `Bearer ${serverEnv.s3.accessKeyId}`,
      },
      body: new Blob([new Uint8Array(input.buffer)], { type: "image/png" }),
    });
    if (!res.ok) throw new Error(`Failed to upload screenshot (${res.status}).`);
    return { url, storageKey: key };
  }
}

let adapter: StorageAdapter | undefined;

export function getStorage(): StorageAdapter {
  if (adapter) return adapter;
  adapter =
    serverEnv.storageDriver === "s3" && serverEnv.s3.endpoint
      ? new S3StorageAdapter()
      : new LocalStorageAdapter();
  return adapter;
}