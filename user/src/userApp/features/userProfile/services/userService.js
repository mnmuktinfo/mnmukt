import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { updateProfile } from "firebase/auth"; // ✅ NEW: Import this
import { db, auth } from "../../../../config/firebaseAuth"; // ✅ NEW: Import auth

/**
 * Edit user profile and sync fields
 * @param {string} uid
 * @param {object} updates
 */
export const editUserProfile = async (uid, updates = {}) => {
  if (!uid) throw new Error("UID is required");

  // Only grab the exact fields we allow to prevent NoSQL injection
  const allowedFields = {
    name: updates.name,
    lastName: updates.lastName,
    gender: updates.gender,
    dateOfBirth: updates.dateOfBirth,
    phone: updates.phone,
    defaultAddressId: updates.defaultAddressId,
    address: updates.address, 
  };

  // Remove undefined fields (Firebase crashes on undefined)
  Object.keys(allowedFields).forEach(
    (k) => allowedFields[k] === undefined && delete allowedFields[k]
  );

  // If the object is empty after stripping undefined, there's nothing to update!
  if (Object.keys(allowedFields).length === 0) return {}; 

  // Add the timestamp AFTER the empty check so we don't waste a database write
  allowedFields.updatedAt = serverTimestamp();

  // 1. Update the Firestore Database
  await updateDoc(doc(db, "users", uid), allowedFields);

  // 2. ✅ CRITICAL ADDITION: Keep Firebase Auth in sync!
  // If the user changed their name, update the Auth object so the UI doesn't show the old name.
  if (allowedFields.name && auth.currentUser) {
    await updateProfile(auth.currentUser, { displayName: allowedFields.name });
  }

  return allowedFields;
};