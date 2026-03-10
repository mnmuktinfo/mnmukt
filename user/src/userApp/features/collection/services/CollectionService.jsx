import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../../config/firebase";

export const FirebaseCollectionService = (
  collectionName = "itemCollection",
) => {
  const colRef = collection(db, collectionName);

  // Fetch all items
  const fetchAll = async () => {
    const snapshot = await getDocs(colRef);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  };

  return { fetchAll };
};
