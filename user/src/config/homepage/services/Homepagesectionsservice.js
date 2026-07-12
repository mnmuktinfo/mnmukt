
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { getCachedOrFetchVersioned, clearCache } from "../../firebaseCache";
import { getHomepageVersion } from "../../homepageVersionService";

const CACHE_KEY = "homepage_sections";
const TTL = 1000 * 60 * 60 * 24; // 24 hours — fetch at most once per visitor per day

// Last-resort fallback if Firestore is empty/unreachable and there's
// no cache at all yet.
export const DEFAULT_SECTIONS = [
  {
    key: "new",
    title: "New Arrivals",
    subtitle:
      "Trending right now and loved by many. Don’t miss out on our most wanted picks.",
    order: 1,
    active: true,
  },
  {
    key: "summer",
    title: "Summer Collection",
    subtitle: "Light and breezy styles for the season",
    order: 2,
    active: true,
  },
  {
    key: "winter",
    title: "Basics",
    subtitle: "Handpicked essentials for your wardrobe",
    order: 3,
    active: true,
  },
  {
    key: "trending",
    title: "Trending",
    subtitle: "Hot styles loved by everyone",
    order: 4,
    active: true,
  },
];

async function fetchSectionsFromFirebase() {
  const q = query(collection(db, "homepageSections"), orderBy("order", "asc"));
  const snap = await getDocs(q);

  if (snap.empty) {
    throw new Error('Firestore collection "homepageSections" is empty');
  }

  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .filter((section) => section.active !== false);
}

export async function getHomepageSections({ forceRefresh = false } = {}) {
  try {
    const sections = await getCachedOrFetchVersioned(
      CACHE_KEY,
      fetchSectionsFromFirebase,
      () => getHomepageVersion("sections"),
      { dataTtl: TTL, forceRefresh }
    );
    return sections?.length ? sections : DEFAULT_SECTIONS;
  } catch (err) {
    console.error(
      "[homepageSectionsService] Falling back to default sections:",
      err
    );
    return DEFAULT_SECTIONS;
  }
}

export function clearHomepageSectionsCache() {
  clearCache(CACHE_KEY);
}