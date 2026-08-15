// ==============================================================================
// ACCOUNT DATA — the single inventory of where personal data lives
// ==============================================================================
//
// GDPR gives users two rights this module implements: export (art. 20) and
// erasure (art. 17). Both need the same thing — an exhaustive list of every
// Firestore collection holding a given user's data, and the field that scopes
// it to them.
//
// That list is a MANIFEST, declared once here, because the failure mode of
// erasure is silent: forget one collection and deletion "succeeds" while the
// user's check-ins (mood, energy — near-health data) live on. A test compares
// this manifest against firestore.rules, so adding a collection without
// deciding its erasure story is a build failure, not a discovery during a
// complaint.

// serverDb() is the single server-side Firestore accessor (see
// lib/firestore-server.ts). It imports firebase-admin lazily: loading this
// module for the MANIFEST alone (tests, docs, client code listing what we
// store) must not boot the Admin SDK, whose module initialises itself on load.
import { serverDb as db } from "./firestore-server";

export type UserCollection = {
  /** Firestore collection name. */
  name: string;
  /** Field holding the owner's uid — or "docId" when the doc id IS the uid. */
  field: string | "docId";
};

/**
 * Every collection that stores personal data, and how it is keyed.
 * Mirrors the match blocks of firestore.rules — the test enforces the mirror.
 */
export const USER_DATA_COLLECTIONS: UserCollection[] = [
  { name: "profiles", field: "docId" },
  { name: "simulations", field: "user_id" },
  { name: "predictions", field: "user_id" },
  { name: "posts", field: "author_id" },
  { name: "skill_tracks", field: "user_id" },
  { name: "skill_missions", field: "user_id" },
  { name: "language_profiles", field: "user_id" },
  { name: "language_progress", field: "user_id" },
  { name: "checkins", field: "user_id" },
  { name: "visas", field: "user_id" },
  { name: "audit_log", field: "user_id" },
  { name: "conversations", field: "user_id" },
];

/** Admin credentials are required — without them we must refuse, not pretend. */
export function adminReady(): boolean {
  return Boolean(process.env.FIREBASE_PRIVATE_KEY);
}

/**
 * Collect every document belonging to `uid`, keyed by collection.
 * This is the payload of the data-export endpoint: the user gets back exactly
 * what the erasure endpoint would delete — same manifest, so the two can never
 * drift apart.
 */
export async function exportUserData(
  uid: string
): Promise<Record<string, unknown[]>> {
  const adminDb = await db();
  const result: Record<string, unknown[]> = {};

  for (const col of USER_DATA_COLLECTIONS) {
    if (col.field === "docId") {
      const snap = await adminDb.collection(col.name).doc(uid).get();
      result[col.name] = snap.exists ? [{ id: snap.id, ...snap.data() }] : [];
    } else {
      const snap = await adminDb
        .collection(col.name)
        .where(col.field, "==", uid)
        .get();
      result[col.name] = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    }
  }

  return result;
}

/**
 * Delete every document belonging to `uid`. Returns per-collection counts so
 * the caller can log an auditable receipt of what was erased.
 *
 * Deletes run collection by collection, in batches of 400 (Firestore caps a
 * batch at 500 operations). A partial failure throws: better to report a
 * failed deletion the user can retry than a "success" that left data behind.
 */
export async function purgeUserData(
  uid: string
): Promise<Record<string, number>> {
  const adminDb = await db();
  const deleted: Record<string, number> = {};

  for (const col of USER_DATA_COLLECTIONS) {
    if (col.field === "docId") {
      const ref = adminDb.collection(col.name).doc(uid);
      const snap = await ref.get();
      if (snap.exists) await ref.delete();
      deleted[col.name] = snap.exists ? 1 : 0;
      continue;
    }

    const snap = await adminDb
      .collection(col.name)
      .where(col.field, "==", uid)
      .get();

    let count = 0;
    for (let i = 0; i < snap.docs.length; i += 400) {
      const batch = adminDb.batch();
      for (const doc of snap.docs.slice(i, i + 400)) {
        batch.delete(doc.ref);
        count++;
      }
      await batch.commit();
    }
    deleted[col.name] = count;
  }

  return deleted;
}
