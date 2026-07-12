/* ============================================================
   HOMEPAGE SCHEMA — SINGLE SOURCE OF TRUTH

   Add / remove / reshape a section here and everything else follows:
     - siteConfigService    -> derives Firestore defaults from this file
     - AdminSiteConfigPanel -> derives its nav + form fields from this file
     - HomePage             -> derives section data from this file

   `order` is a spacing convention, not a strict sequence - values are
   left 10 apart on purpose so a section can be nudged between two
   others (in the schema, or via admin up/down, which swaps two
   sections' order values) without renumbering everything else.

   Each entry in SECTION_TYPES is either:
     - singleton: true  -> exactly one instance, doc id === type id
     - singleton: false -> repeatable, admin can add/remove instances,
                            each gets a generated doc id, `defaultOrder`
                            seeds where a newly-added one lands

   The ONE place you still touch outside this file: if a new section
   needs a genuinely new visual layout (not just another image list or
   banner), register a renderer in HomePage's SECTION_RENDERERS map.
   Reusing an existing `component` value needs no HomePage.jsx edit.
   ============================================================ */

export const FIELD = {
  IMAGE_LIST: "imageList",
  SINGLE_IMAGE: "singleImage",
  NAMED_IMAGE_LIST: "namedImageList",
  HERO_SLIDES: "heroSlides",
  TILE_LIST: "tileList",
  TEXT: "text",
  TOGGLE: "toggle",
  DATETIME: "datetime",
};

/** @deprecated use FIELD — kept so older imports don't break */
export const FIELD_TYPES = FIELD;

/* Keys HomePage.jsx's SECTION_RENDERERS map implements. */
export const SECTION_COMPONENTS = {
  HERO: "hero",
  NAMED_IMAGE_GRID: "namedImageGrid",
  LOGO_STRIP: "logoStrip",
  FLASH_SALE: "flashSale",
  OFFER_STRIP: "offerStrip",
  IMAGE_STRIP: "imageStrip",
};

/* Bump this if the *shape* of any section's or page's `data` changes in
   a way that requires migrating existing Firestore docs. Cheap insurance
   now, expensive to add retroactively once docs are already in prod. */
export const SCHEMA_VERSION = 1;

/* ---------- shared helpers - declared once, used everywhere below ---------- */

/** Deep-clones plain JSON-shaped data (defaultData: strings, numbers,
 *  booleans, arrays, plain objects). Every consumer that hands out a
 *  section's defaultData MUST clone it first - otherwise two callers
 *  end up sharing (and mutating) the same object living in this schema. */
export const deepClone = (value) =>
  typeof structuredClone === "function"
    ? structuredClone(value)
    : JSON.parse(JSON.stringify(value));

/** Firestore throws on `undefined` field values unless you've enabled
 *  ignoreUndefinedProperties. Run any section's `data` through this
 *  right before setDoc/updateDoc so a stray undefined never reaches
 *  the SDK. */
export const stripUndefined = (value) => {
  if (Array.isArray(value)) return value.map(stripUndefined);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, v]) => v !== undefined)
        .map(([k, v]) => [k, stripUndefined(v)]),
    );
  }
  return value;
};

/* ------------------------------------------------------------
   SECTION_TYPES
   Reorderable content blocks in the homepage feed. `order` /
   `defaultOrder` / `enabledByDefault` only seed a section the FIRST
   time it's ever loaded (no Firestore doc yet). After the admin saves
   once, the saved order/enabled flags win over these.
   ------------------------------------------------------------ */
export const SECTION_TYPES = [
  {
    id: "hero",
    label: "Hero Banners",
    icon: "🖼️",
    singleton: true,
    order: 10,
    enabledByDefault: true,
    component: SECTION_COMPONENTS.HERO,
    defaultData: { desktop: [], mobile: [] },
    fields: [
      { key: "desktop", label: "Desktop Slides", type: FIELD.HERO_SLIDES },
      { key: "mobile", label: "Mobile Slides", type: FIELD.HERO_SLIDES },
    ],
  },
  {
    id: "offers",
    label: "Offers & Promo",
    icon: "🎁",
    singleton: true,
    order: 30,
    enabledByDefault: true,
    component: SECTION_COMPONENTS.OFFER_STRIP,
    defaultData: { promoBanner: "", offerStripText: "" },
    fields: [
      { key: "promoBanner", label: "Promo Banner", type: FIELD.SINGLE_IMAGE },
      { key: "offerStripText", label: "Offer Strip Text", type: FIELD.TEXT },
    ],
  },
  {
    id: "flashSale",
    label: "Flash Sale",
    icon: "⚡",
    singleton: true,
    order: 50,
    enabledByDefault: true,
    component: SECTION_COMPONENTS.FLASH_SALE,
    defaultData: { title: "", banner: "", endTime: "", productSectionKey: "" },
    fields: [
      { key: "title", label: "Title", type: FIELD.TEXT },
      { key: "banner", label: "Banner", type: FIELD.SINGLE_IMAGE },
      { key: "endTime", label: "Ends At", type: FIELD.DATETIME },
      { key: "productSectionKey", label: "Linked Product Section Key", type: FIELD.TEXT },
    ],
  },
  {
    id: "featuredCategories",
    label: "Featured Categories",
    icon: "🗂️",
    singleton: true,
    order: 70,
    enabledByDefault: true,
    component: SECTION_COMPONENTS.NAMED_IMAGE_GRID,
    defaultData: { items: [] },
    fields: [{ key: "items", label: "Category Tiles", type: FIELD.NAMED_IMAGE_LIST }],
  },
  {
    id: "featuredBrands",
    label: "Brand Logos",
    icon: "✨",
    singleton: true,
    order: 150,
    enabledByDefault: true,
    component: SECTION_COMPONENTS.LOGO_STRIP,
    defaultData: { items: [] },
    fields: [{ key: "items", label: "Brand Logos", type: FIELD.NAMED_IMAGE_LIST }],
  },
  {
    id: "socialFeed",
    label: "Social Feed",
    icon: "📸",
    singleton: true,
    order: 180,
    enabledByDefault: true,
    component: SECTION_COMPONENTS.IMAGE_STRIP,
    defaultData: { title: "Follow Us", handle: "", images: [] },
    fields: [
      { key: "title", label: "Title", type: FIELD.TEXT },
      { key: "handle", label: "Instagram Handle", type: FIELD.TEXT },
      { key: "images", label: "Images", type: FIELD.IMAGE_LIST },
    ],
  },
  {
    id: "promoTiles",
    label: "Promo Tiles",
    icon: "🏷️",
    singleton: false, // repeatable: admin can add multiple tile groups
    defaultOrder: 200,
    enabledByDefault: true,
    component: SECTION_COMPONENTS.OFFER_STRIP,
    defaultData: { items: [] },
    fields: [{ key: "items", label: "Tiles", type: FIELD.TILE_LIST }],
  },
];

export const SINGLETON_TYPES = SECTION_TYPES.filter((t) => t.singleton);
export const REPEATABLE_TYPES = SECTION_TYPES.filter((t) => !t.singleton);

export const getSectionType = (id) => SECTION_TYPES.find((t) => t.id === id);

/** Instance for a singleton type — doc id is always the type id. */
export const buildDefaultInstance = (type) => ({
  id: type.id,
  type: type.id,
  enabled: type.enabledByDefault,
  order: type.order,
  schemaVersion: SCHEMA_VERSION,
  data: deepClone(type.defaultData),
});

/** Instance for a repeatable type — caller supplies a generated id. */
export const buildRepeatableInstance = (type, id) => ({
  id,
  type: type.id,
  enabled: type.enabledByDefault ?? true,
  order: type.defaultOrder ?? 0,
  schemaVersion: SCHEMA_VERSION,
  data: deepClone(type.defaultData),
});

/** Default set of singleton sections for a brand-new install. */
export const getDefaultSections = () =>
  SINGLETON_TYPES.slice()
    .sort((a, b) => a.order - b.order)
    .map(buildDefaultInstance);

/* ------------------------------------------------------------
   PAGE_SECTIONS_SCHEMA
   Content pinned to a specific doc/page, not the reorderable feed
   (login screen, the brand microsite). Same field-driven editor,
   no order/enabled - these always exist, always in the same place.
   ------------------------------------------------------------ */
export const PAGE_SECTIONS_SCHEMA = [
  {
    id: "auth",
    label: "Login / Signup",
    icon: "🔐",
    defaultData: { loginBanner: "", signupBanner: "", signupOfferBanner: "" },
    fields: [
      { key: "loginBanner", label: "Login Banner", type: FIELD.SINGLE_IMAGE },
      { key: "signupBanner", label: "Signup Banner", type: FIELD.SINGLE_IMAGE },
      { key: "signupOfferBanner", label: "Signup Offer Banner", type: FIELD.SINGLE_IMAGE },
    ],
  },
  {
    id: "taruveda",
    label: "Brand Page",
    icon: "🏷️",
    defaultData: {
      heroDesktop: [],
      heroMobile: [],
      ingredientStory: "",
      comboBanner: "",
      benefitsBanner: "",
      categories: [],
      testimonials: [],
    },
    fields: [
      { key: "heroDesktop", label: "Hero — Desktop Slides", type: FIELD.IMAGE_LIST },
      { key: "heroMobile", label: "Hero — Mobile Slides", type: FIELD.IMAGE_LIST },
      { key: "ingredientStory", label: "Ingredient Story Banner", type: FIELD.SINGLE_IMAGE },
      { key: "comboBanner", label: "Combo Banner", type: FIELD.SINGLE_IMAGE },
      { key: "benefitsBanner", label: "Benefits Banner", type: FIELD.SINGLE_IMAGE },
      { key: "categories", label: "Category Tiles", type: FIELD.NAMED_IMAGE_LIST },
      { key: "testimonials", label: "Testimonial Images", type: FIELD.IMAGE_LIST },
    ],
  },
];

export const getPageSchema = (id) => PAGE_SECTIONS_SCHEMA.find((s) => s.id === id);

export const getDefaultPageData = (id) => {
  const def = getPageSchema(id);
  return def ? deepClone(def.defaultData) : {};
};