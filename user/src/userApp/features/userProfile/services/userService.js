import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../../../config/firebase";

/**
 * Edit user profile and sync fields
 * @param {string} uid
 * @param {object} updates
 */
export const editUserProfile = async (uid, updates) => {
  if (!uid) throw new Error("UID is required");

  const allowedFields = {
    name: updates.name,
    lastName: updates.lastName,
    gender: updates.gender,
    dateOfBirth: updates.dateOfBirth,
    phone: updates.phone,

    // ✅ CRITICAL: Allow saving the link to the default address
    defaultAddressId: updates.defaultAddressId,

    // ✅ OPTIONAL: Allow saving the cached address object (if used)
    address: updates.address, 

    updatedAt: serverTimestamp(),
  };

  // remove undefined fields
  Object.keys(allowedFields).forEach(
    (k) => allowedFields[k] === undefined && delete allowedFields[k]
  );

  await updateDoc(doc(db, "users", uid), allowedFields);

  return allowedFields;
};