import { serverEnv } from "../env";
import type { Store } from "./types";
import { FileStore } from "./file";

export type { Store } from "./types";

let store: Store | undefined;

export async function getStore(): Promise<Store> {
  if (store) return store;

  if (serverEnv.storeDriver === "prisma" && serverEnv.databaseUrl) {
    const { PrismaStore } = await import("./prisma");
    store = new PrismaStore();
  } else {
    store = new FileStore(process.env.STORE_DIR ?? ".data");
  }
  return store;
}

export function resetStoreForTests(): void {
  store = undefined;
}