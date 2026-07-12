

import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "../../auth/context/UserContext";
import {
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress as deleteAddressRemote,
  setDefaultAddress as setDefaultAddressRemote,
} from "../../auth/services/authService";
import {
  getGuestAddresses,
  saveGuestAddress,
  deleteGuestAddress,
  setDefaultGuestAddress,
} from "../services/guestAddressService";
import { OrderValidationService } from "../../orders/services/core/orderValidation.service";
import { EMPTY_ADDRESS_FORM } from "../../orders/services/schema";

const buildEmptyDraft = (user) => ({
  ...EMPTY_ADDRESS_FORM,
  email: user?.email || "",
  fullName: user?.name || "",
  phone: user?.phone || "",
});

// FIX (security/UX): raw err.message from Firestore/auth/storage layers can
// leak internal details (project ids, provider-specific wording, stack-ish
// text) straight into the UI. Map known cases to friendly copy and fall
// back to a generic message for anything unrecognized, while still logging
// the original error for debugging/monitoring.
const toFriendlyMessage = (err, fallback) => {
  const code = err?.code || "";
  const raw = err?.message || "";

  if (code === "permission-denied" || /permission/i.test(raw)) {
    return "You don't have permission to do that. Please sign in again.";
  }
  if (code === "unavailable" || /network|offline|failed to fetch/i.test(raw)) {
    return "Network issue — please check your connection and try again.";
  }
  if (code === "not-found" || /not found/i.test(raw)) {
    return "That address could no longer be found. Please refresh and try again.";
  }
  if (/quota|resource-exhausted/i.test(raw) || code === "resource-exhausted") {
    return "We're experiencing high demand — please try again in a moment.";
  }

  return fallback;
};

const logAndFriendly = (err, fallback) => {
  // Full detail stays in the console/monitoring, only the safe message
  // reaches state (and therefore the UI).
  console.error(err);
  return toFriendlyMessage(err, fallback);
};

export function useAddressBook() {
  const { user } = useAuth();
  const isGuest = !user;

  // Kept in a ref so async callbacks always see the latest uid without
  // needing to be re-created every render.
  const uidRef = useRef(user?.uid);
  uidRef.current = user?.uid;

  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [addressDraft, setAddressDraft] = useState(() => buildEmptyDraft(user));
  const [formErrors, setFormErrors] = useState({});
  const [isEditing, setIsEditing] = useState(true);
  const [listLoading, setListLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");

  const selectedIdRef = useRef(null);
  selectedIdRef.current = selectedAddress?.id ?? null;

  // Reconciles a freshly-fetched list into state. If `keepSelection` is
  // true and the previously-selected address still exists in the new list,
  // it stays selected; otherwise falls back to the default, then the first
  // address, then an empty "add new" draft.
  const applyList = useCallback(
    (list, { keepSelection = false } = {}) => {
      setAddresses(list);

      const previousId = selectedIdRef.current;
      const stillExists = keepSelection && list.find((a) => a.id === previousId);

      const next = stillExists || list.find((a) => a.isDefault) || list[0] || null;

      if (next) {
        setSelectedAddress(next);
        setAddressDraft(next);
        setIsEditing(false);
      } else {
        setSelectedAddress(null);
        setAddressDraft(buildEmptyDraft(user));
        setIsEditing(true);
      }
    },
    [user],
  );

  // (Re)load the address book whenever auth identity changes, i.e. on
  // mount, on login, and on logout.
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setListLoading(true);
      setActionError("");
      try {
        const list = isGuest ? getGuestAddresses() : (await getAddresses(user.uid)) || [];
        if (cancelled) return;
        applyList(list);
      } catch (err) {
        if (!cancelled) {
          // FIX: was console.error("Failed to load addresses:", err) with
          // no user-facing surface at all — addresses would silently look
          // empty. Now we log AND surface a friendly message via
          // actionError so the UI can show something meaningful.
          setActionError(
            logAndFriendly(err, "Failed to load your addresses."),
          );
          setAddresses([]);
          setSelectedAddress(null);
          setAddressDraft(buildEmptyDraft(user));
          setIsEditing(true);
        }
      } finally {
        if (!cancelled) setListLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isGuest, user?.uid]);

  const handleAddressChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setAddressDraft((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setFormErrors((prev) => (prev[name] ? { ...prev, [name]: null } : prev));
  }, []);

  const startNewAddress = useCallback(() => {
    setAddressDraft(buildEmptyDraft(user));
    setSelectedAddress(null);
    setFormErrors({});
    setActionError("");
    setIsEditing(true);
  }, [user]);

  const startEditAddress = useCallback((address) => {
    setAddressDraft(address);
    setFormErrors({});
    setActionError("");
    setIsEditing(true);
  }, []);

  const cancelEdit = useCallback(() => {
    setAddressDraft(selectedAddress || buildEmptyDraft(user));
    setFormErrors({});
    setActionError("");
    // Only leave edit mode if there's actually something to fall back to —
    // otherwise the form would just vanish with nothing to show.
    setIsEditing(!selectedAddress);
  }, [selectedAddress, user]);

  const selectAddress = useCallback((address) => {
    setSelectedAddress(address);
    setAddressDraft(address);
    setIsEditing(false);
    setFormErrors({});
    setActionError("");
  }, []);

  // Persists `addressDraft` (create or update) and returns the resolved,
  // saved address object on success — or `null` on failure. Callers should
  // treat the return value as "the address to ship to", not as a plain
  // success flag.
  const saveAddress = useCallback(async () => {
    const validation = OrderValidationService.validateAddress(addressDraft);
    if (!validation.isValid) {
      setFormErrors(validation.errors || { form: validation.error });
      return null;
    }

    setActionLoading(true);
    setActionError("");

    try {
      let saved;
      let list;

      if (isGuest) {
        saved = saveGuestAddress(addressDraft);
        list = getGuestAddresses();
      } else {
        const uid = uidRef.current;
        saved = addressDraft.id
          ? await updateAddress(uid, addressDraft.id, addressDraft)
          : await addAddress(uid, addressDraft);
        list = (await getAddresses(uid)) || [];
      }

      setAddresses(list);
      const resolved = list.find((a) => a.id === saved.id) || saved;
      setSelectedAddress(resolved);
      setAddressDraft(resolved);
      setIsEditing(false);
      setFormErrors({});
      return resolved;
    } catch (err) {
      // FIX: was setActionError(err.message || "Failed to save address.")
      // which could surface raw backend error text to the user.
      setActionError(logAndFriendly(err, "Failed to save address."));
      return null;
    } finally {
      setActionLoading(false);
    }
  }, [addressDraft, isGuest]);

  const removeAddress = useCallback(
    async (address) => {
      setActionLoading(true);
      setActionError("");
      try {
        const list = isGuest
          ? deleteGuestAddress(address.id)
          : await (async () => {
              await deleteAddressRemote(uidRef.current, address.id);
              return (await getAddresses(uidRef.current)) || [];
            })();

        applyList(list, { keepSelection: address.id !== selectedIdRef.current });
        return true;
      } catch (err) {
        // FIX: friendly message instead of raw err.message.
        setActionError(logAndFriendly(err, "Failed to delete address."));
        return false;
      } finally {
        setActionLoading(false);
      }
    },
    [isGuest, applyList],
  );

  const markDefault = useCallback(
    async (address) => {
      setActionLoading(true);
      setActionError("");
      try {
        const list = isGuest
          ? setDefaultGuestAddress(address.id)
          : await (async () => {
              await setDefaultAddressRemote(uidRef.current, address.id);
              return (await getAddresses(uidRef.current)) || [];
            })();

        applyList(list, { keepSelection: true });
        return true;
      } catch (err) {
        // FIX: friendly message instead of raw err.message.
        setActionError(logAndFriendly(err, "Failed to set default address."));
        return false;
      } finally {
        setActionLoading(false);
      }
    },
    [isGuest, applyList],
  );

  return {
    isGuest,
    addresses,
    selectedAddress,
    addressDraft,
    formErrors,
    isEditing,
    listLoading,
    actionLoading,
    actionError,
    handleAddressChange,
    startNewAddress,
    startEditAddress,
    cancelEdit,
    selectAddress,
    saveAddress,
    removeAddress,
    markDefault,
  };
}

export default useAddressBook;