"use client";

import { openDB, type IDBPDatabase } from "idb";
import { createClient } from "@/lib/supabase/client";
import type { ExtractionResult, PaymentMethod } from "@/lib/types";

export type ExpenseDraft = {
  merchant: string;
  amount_cents: number | null;
  expense_date: string | null;
  category_code: string;
  business_purpose: string | null;
  is_business: boolean;
  payment_method: PaymentMethod | null;
  card_last4: string | null;
  card_id: string | null;
  check_number: string | null;
  reference_number: string | null;
  sub_id: string | null;
  new_card_is_business: boolean;
  new_card_nickname: string | null;
  skip_dupe_check: boolean;
  raw_extraction: ExtractionResult | null;
};

export type QueueStatus =
  | "pending"
  | "uploading"
  | "committing"
  | "duplicate"
  | "failed_image";

export type DuplicateOf = {
  id: string;
  merchant: string | null;
  expense_date: string | null;
  amount_cents: number | null;
};

export type QueuedExpense = {
  local_id: string;
  created_at: number;
  draft: ExpenseDraft;
  receipt_path: string | null;
  image_blob: Blob | null;
  attempts: number;
  last_error: string | null;
  next_attempt_at: number;
  status: QueueStatus;
  duplicate_of: DuplicateOf | null;
};

const DB_NAME = "snap-expense-queue";
const STORE = "queued";
const VERSION = 1;

let dbPromise: Promise<IDBPDatabase> | null = null;
function getDb() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE)) {
          db.createObjectStore(STORE, { keyPath: "local_id" });
        }
      },
    });
  }
  return dbPromise;
}

type Listener = (items: QueuedExpense[]) => void;
const listeners = new Set<Listener>();

async function rawList(): Promise<QueuedExpense[]> {
  const db = await getDb();
  const items = (await db.getAll(STORE)) as QueuedExpense[];
  items.sort((a, b) => b.created_at - a.created_at);
  return items;
}

async function notify() {
  const items = await rawList();
  for (const l of listeners) l(items);
}

const BACKOFF_MS = [5_000, 15_000, 30_000, 60_000, 5 * 60_000, 15 * 60_000];
const COMMIT_TIMEOUT_MS = 20_000;

let processing = false;
let scheduledTimer: ReturnType<typeof setTimeout> | null = null;

async function processPending() {
  if (typeof window === "undefined") return;
  if (processing) return;
  processing = true;
  try {
    while (true) {
      if (!navigator.onLine) break;
      const items = await rawList();
      const now = Date.now();
      const item = items.find(
        (i) =>
          i.next_attempt_at <= now &&
          i.status !== "duplicate" &&
          i.status !== "failed_image",
      );
      if (!item) break;
      await drainOne(item);
    }
  } finally {
    processing = false;
    void scheduleNext();
  }
}

async function scheduleNext() {
  if (scheduledTimer) {
    clearTimeout(scheduledTimer);
    scheduledTimer = null;
  }
  const items = await rawList();
  const future = items
    .filter((i) => i.status !== "duplicate" && i.status !== "failed_image")
    .map((i) => i.next_attempt_at)
    .filter((t) => t > Date.now());
  if (future.length === 0) return;
  const nextAt = Math.min(...future);
  scheduledTimer = setTimeout(
    () => void processPending(),
    Math.max(100, nextAt - Date.now()),
  );
}

async function updateState(localId: string, patch: Partial<QueuedExpense>) {
  const db = await getDb();
  const item = (await db.get(STORE, localId)) as QueuedExpense | undefined;
  if (!item) return;
  Object.assign(item, patch);
  await db.put(STORE, item);
  void notify();
}

async function markFailure(
  item: QueuedExpense,
  msg: string,
  retry: boolean,
) {
  const attempts = item.attempts + 1;
  const backoff = retry
    ? BACKOFF_MS[Math.min(attempts - 1, BACKOFF_MS.length - 1)]
    : 5 * 60_000;
  await updateState(item.local_id, {
    status: "pending",
    last_error: msg,
    attempts,
    next_attempt_at: Date.now() + backoff,
  });
}

async function drainOne(item: QueuedExpense) {
  const supabase = createClient();

  if (!item.receipt_path && item.image_blob) {
    await updateState(item.local_id, { status: "uploading" });
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        await markFailure(item, "Not signed in", true);
        return;
      }
      const path = `${user.id}/${item.created_at}-${item.local_id}.jpg`;
      const { error } = await supabase.storage
        .from("receipts")
        .upload(path, item.image_blob, {
          contentType: "image/jpeg",
          upsert: false,
        });
      if (error) throw new Error(error.message);
      await updateState(item.local_id, {
        receipt_path: path,
        image_blob: null,
        status: "pending",
        last_error: null,
      });
      item.receipt_path = path;
      item.image_blob = null;
    } catch (err) {
      const msg = (err as Error).message || "Image upload failed";
      const attempts = item.attempts + 1;
      if (attempts >= BACKOFF_MS.length) {
        await updateState(item.local_id, {
          status: "failed_image",
          last_error: msg,
          attempts,
        });
      } else {
        await markFailure(item, msg, true);
      }
      return;
    }
  }

  await updateState(item.local_id, { status: "committing" });
  try {
    const { commitExpenseAction } = await import(
      "@/app/(app)/capture/actions"
    );
    const result = await Promise.race([
      commitExpenseAction({
        ...item.draft,
        receipt_path: item.receipt_path,
      }),
      new Promise<{ success: false; error: string }>((resolve) =>
        setTimeout(
          () => resolve({ success: false, error: "Request timed out" }),
          COMMIT_TIMEOUT_MS,
        ),
      ),
    ]);

    if (result.success) {
      await removeItem(item.local_id);
      return;
    }

    if (result.error === "duplicate" && "duplicateOf" in result && result.duplicateOf) {
      await updateState(item.local_id, {
        status: "duplicate",
        duplicate_of: result.duplicateOf,
        last_error: null,
      });
      return;
    }

    await markFailure(item, result.error ?? "Save failed", true);
  } catch (err) {
    await markFailure(item, (err as Error).message || "Save failed", true);
  }
}

async function removeItem(localId: string) {
  const db = await getDb();
  await db.delete(STORE, localId);
  void notify();
}

export const expenseQueue = {
  list: rawList,

  async enqueue(
    draft: ExpenseDraft,
    imageBlob: Blob | null,
    receiptPath: string | null,
  ): Promise<QueuedExpense> {
    const item: QueuedExpense = {
      local_id: crypto.randomUUID(),
      created_at: Date.now(),
      draft,
      receipt_path: receiptPath,
      image_blob: imageBlob,
      attempts: 0,
      last_error: null,
      next_attempt_at: 0,
      status: "pending",
      duplicate_of: null,
    };
    const db = await getDb();
    await db.put(STORE, item);
    void notify();
    void processPending();
    return item;
  },

  async setReceiptPath(localId: string, path: string) {
    await updateState(localId, {
      receipt_path: path,
      image_blob: null,
    });
  },

  remove: removeItem,

  subscribe(cb: Listener): () => void {
    listeners.add(cb);
    void rawList().then(cb);
    return () => {
      listeners.delete(cb);
    };
  },

  processPending,

  async retryNow(localId: string) {
    await updateState(localId, {
      next_attempt_at: 0,
      last_error: null,
      status: "pending",
    });
    void processPending();
  },

  async saveWithoutReceipt(localId: string) {
    await updateState(localId, {
      image_blob: null,
      status: "pending",
      last_error: null,
      next_attempt_at: 0,
    });
    void processPending();
  },

  discard: removeItem,
};

if (typeof window !== "undefined") {
  window.addEventListener("online", () => void processPending());
  window.addEventListener("focus", () => void processPending());
  setTimeout(() => void processPending(), 100);
}
