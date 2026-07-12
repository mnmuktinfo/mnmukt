import {
  collection,
  doc,
  deleteDoc,
  getDoc,
  getDocs,
  setDoc,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
import { db } from "../firebaseConfig";
import {
  SINGLETON_TYPES,
  SCHEMA_VERSION,
  buildDefaultInstance,
  getSectionType,
  stripUndefined,
  deepClone,
} from "./homepageSchema";

/* One Firestore collection, one doc per SECTION INSTANCE. Singleton types
   use their type id as the doc id; repeatable types (e.g. productGrid) use
   a generated id. Every doc has the same shape:
   { type, enabled, order, data, schemaVersion, updatedAt }.
   This file never hardcodes a section name — it only knows that shape and
   defers everything else to homepageSchema.js. */
const COLLECTION = "homepageSections";
const CACHE_KEY = "site_config_cache_v3";
const CACHE_TTL_MS = 5 * 60 * 1000;

let inFlightFetch = null;

/* ---------- user-facing error reporting ----------
   Every write/read the person directly triggers surfaces failures via
   window.alert (in addition to a full console.error for debugging), so a
   failed save never fails silently. Background cache revalidation is the
   one exception — it's not something the person asked for, so it just logs. */
const reportError = (action, err) => {
  console.error(`[siteConfigService] ${action} failed:`, err);
  if (typeof window !== "undefined" && typeof window.alert === "function") {
    window.alert(
      `${action} failed: ${err?.message || "Something went wrong. Check the console for details."}`,
    );
  }
};
const readCache = () => {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return { ...parsed, stale: Date.now() - parsed.fetchedAt > CACHE_TTL_MS };
  } catch {
    return null;
  }
};

const writeCache = (data) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ data, fetchedAt: Date.now() }));
  } catch {
    // caching is an optimization only, never load-bearing
  }
  return data; // lets callers do `.then(writeCache)` and keep chaining
};

const invalidateCache = () => {
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch {
    /* ignore */
  }
};

const fetchFromFirestore = async () => {
  const snap = await getDocs(collection(db, COLLECTION));
  const byId = {};
  snap.forEach((docSnap) => {
    byId[docSnap.id] = { id: docSnap.id, ...docSnap.data() };
  });

  // singleton types always render, even before their first save
  SINGLETON_TYPES.forEach((type) => {
    if (!byId[type.id]) {
      byId[type.id] = buildDefaultInstance(type);
    } else {
      // deep-clone the fallback so a doc missing a nested field (e.g. an
      // empty `items` array) never ends up pointing at the same array
      // object that lives in homepageSchema.js
      byId[type.id].data = { ...deepClone(type.defaultData), ...byId[type.id].data };
    }
  });

  const sections = Object.values(byId).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  return { sections };
};

export const getSiteConfig = async ({ forceRefresh = false } = {}) => {
  const cached = readCache();

  if (cached && !forceRefresh) {
    if (cached.stale) {
      // Best-effort background revalidation — never blocks the caller,
      // never alerts (the person already has usable, if slightly stale,
      // data on screen).
      fetchFromFirestore()
        .then(writeCache)
        .catch((err) => console.error("[siteConfigService] background refresh failed:", err));
    }
    return { data: cached.data, fromCache: true };
  }

  if (!inFlightFetch) {
    inFlightFetch = fetchFromFirestore()
      .then(writeCache)
      .catch((err) => {
        reportError("Loading site config", err);
        throw err;
      })
      .finally(() => {
        inFlightFetch = null;
      });
  }

  return { data: await inFlightFetch, fromCache: false };
};

/* ---------- writes: generic, works for any type in the schema ---------- */
const buildWritePayload = ({ type, enabled, order, data }) => {
  if (!getSectionType(type)) {
    throw new Error(`Unknown section type "${type}" — check homepageSchema.js`);
  }
  return {
    type,
    enabled: !!enabled,
    order: Number(order) || 0,
    data: stripUndefined(data),
    schemaVersion: SCHEMA_VERSION,
    updatedAt: serverTimestamp(),
  };
};

export const saveSectionInstance = async (instanceId, instance) => {
  if (!instanceId) throw new Error("saveSectionInstance: instanceId is required");
  try {
    await setDoc(doc(db, COLLECTION, instanceId), buildWritePayload(instance), { merge: true });
    invalidateCache();
  } catch (err) {
    reportError(`Saving "${instance?.type ?? instanceId}"`, err);
    throw err;
  }
};

export const deleteSectionInstance = async (instanceId) => {
  try {
    await deleteDoc(doc(db, COLLECTION, instanceId));
    invalidateCache();
  } catch (err) {
    reportError(`Deleting section "${instanceId}"`, err);
    throw err;
  }
};

export const saveSectionsBatch = async (instances) => {
  try {
    const batch = writeBatch(db);
    instances.forEach((instance) => {
      batch.set(doc(db, COLLECTION, instance.id), buildWritePayload(instance), { merge: true });
    });
    await batch.commit();
    invalidateCache();
  } catch (err) {
    reportError("Saving section changes", err);
    throw err;
  }
};

/** Bypasses cache — used by the admin panel to detect concurrent edits. */
export const getSectionInstanceRaw = async (instanceId) => {
  try {
    const snap = await getDoc(doc(db, COLLECTION, instanceId));
    return snap.exists() ? snap.data() : null;
  } catch (err) {
    reportError("Checking for conflicting edits", err);
    throw err;
  }
};