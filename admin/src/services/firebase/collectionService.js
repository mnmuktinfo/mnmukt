import { collection, getDocs, addDoc, deleteDoc, updateDoc, doc } from "firebase/firestore";
import { db } from "../../config/firebase";

export const FirebaseCollectionService = (collectionName = "itemCollection") => {
  const colRef = collection(db, collectionName);

  // Fetch all items
  const fetchAll = async () => {
    const snapshot = await getDocs(colRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  };

  // Add a new item
  const addItem = async ({ name, imageUrl }) => {
    const docRef = await addDoc(colRef, { name, imageUrl });
    return { id: docRef.id, name, imageUrl };
  };

  // Delete an item
  const deleteItem = async (id) => {
    await deleteDoc(doc(db, collectionName, id));
  };

  // Update an item
  const updateItem = async (id, { name, imageUrl }) => {
    const updateData = { name };
    if (imageUrl) updateData.imageUrl = imageUrl;
    await updateDoc(doc(db, collectionName, id), updateData);
    return updateData;
  };

  return { fetchAll, addItem, deleteItem, updateItem };
};
