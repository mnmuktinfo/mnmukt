

const GUEST_ADDRESS_KEY = "mnmukt_guest_addresses";

const readAll = () => {
  try {
    const raw = localStorage.getItem(GUEST_ADDRESS_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
};

const writeAll = (list) => {
  try {
    localStorage.setItem(GUEST_ADDRESS_KEY, JSON.stringify(list));
  } catch (e) {
    console.warn("Guest address cache write failed", e);
  }
};

const normalize = (address) => ({
  id: address.id || crypto.randomUUID(),
  fullName: address.fullName || address.name || "",
  email: address.email || "",
  phone: address.phone || "",
  addressLine1: address.addressLine1 || address.line1 || "",
  addressLine2: address.addressLine2 || address.line2 || "",
  landmark: address.landmark || "",
  city: address.city || "",
  district: address.district || "",
  state: address.state || "",
  postalCode: address.postalCode || address.pincode || "",
  country: address.country || "India",
  tag: address.tag || "Home",
  isDefault: address.isDefault || false,
});

export const getGuestAddresses = () => readAll();

/**
 * Create or update a guest address. If isDefault is true, unsets it on all
 * other addresses. The very first address a guest ever saves becomes default
 * automatically.
 */
export const saveGuestAddress = (address) => {
  const list = readAll();
  const normalized = normalize(address);
  const existingIndex = list.findIndex((a) => a.id === normalized.id);

  if (normalized.isDefault) {
    list.forEach((a) => {
      a.isDefault = false;
    });
  }

  if (existingIndex >= 0) {
    list[existingIndex] = normalized;
  } else {
    if (list.length === 0) normalized.isDefault = true;
    list.push(normalized);
  }

  writeAll(list);
  return normalized;
};

export const deleteGuestAddress = (addressId) => {
  const list = readAll().filter((a) => a.id !== addressId);
  if (list.length > 0 && !list.some((a) => a.isDefault)) {
    list[0].isDefault = true;
  }
  writeAll(list);
  return list;
};

export const setDefaultGuestAddress = (addressId) => {
  const list = readAll().map((a) => ({ ...a, isDefault: a.id === addressId }));
  writeAll(list);
  return list;
};

export const clearGuestAddresses = () => writeAll([]);