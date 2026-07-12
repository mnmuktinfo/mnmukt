
import { doc, getDoc } from "firebase/firestore";
// ⚠️ Adjust this import to wherever your app initializes Firestore.
import { db } from "../../firebase/firebaseConfig";
import { getCachedOrFetchVersioned, clearCache } from "../utils/firebaseCache";
import { getHomepageVersion } from "../../homepageVersionService";
import { DEFAULT_HOMEPAGE_ASSETS } from "./defaultHomepageAssets";

const CACHE_KEY = "homepage_assets";
const TTL = 1000 * 60 * 60 * 24; // 24 hours — fetch at most once per visitor per day

function normalizeAssets(raw = {}) {
  const fallback = DEFAULT_HOMEPAGE_ASSETS;

  return {
    brand: {
      logo: raw?.brand?.logo || fallback.brand.logo,
      logoWhite: raw?.brand?.logoWhite || fallback.brand.logoWhite,
      googleIcon: raw?.brand?.googleIcon || fallback.brand.googleIcon,
    },
    auth: {
      loginBanner: raw?.auth?.loginBanner || fallback.auth.loginBanner,
      signupBanner: raw?.auth?.signupBanner || fallback.auth.signupBanner,
      signupOfferBanner:
        raw?.auth?.signupOfferBanner || fallback.auth.signupOfferBanner,
    },
    hero: {
      desktopSlides:
        Array.isArray(raw?.hero?.desktopSlides) && raw.hero.desktopSlides.length
          ? raw.hero.desktopSlides
          : fallback.hero.desktopSlides,
      mobileSlides:
        Array.isArray(raw?.hero?.mobileSlides) && raw.hero.mobileSlides.length
          ? raw.hero.mobileSlides
          : fallback.hero.mobileSlides,
    },
    taruveda: {
      ...fallback.taruveda,
      ...(raw?.taruveda || {}),
    },
    updatedAt: raw?.updatedAt?.toMillis
      ? raw.updatedAt.toMillis()
      : raw?.updatedAt || null,
  };
}

async function fetchHomepageAssetsFromFirebase() {
  const ref = doc(db, "siteConfig", "homepageAssets");
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    throw new Error(
      'Firestore document "siteConfig/homepageAssets" does not exist'
    );
  }

  return normalizeAssets(snap.data());
}

/**
 * Get homepage assets — cached in localStorage, refetched from
 * Firestore only when the cache is missing/expired or forceRefresh
 * is passed (e.g. from an admin "refresh site data" button).
 */
export async function getHomepageAssets({ forceRefresh = false } = {}) {
  try {
    return await getCachedOrFetchVersioned(
      CACHE_KEY,
      fetchHomepageAssetsFromFirebase,
      () => getHomepageVersion("assets"),
      { dataTtl: TTL, forceRefresh }
    );
  } catch (err) {
    console.error(
      "[homepageAssetsService] Falling back to default assets:",
      err
    );
    return DEFAULT_HOMEPAGE_ASSETS;
  }
}

export function clearHomepageAssetsCache() {
  clearCache(CACHE_KEY);
}