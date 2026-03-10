import { useState, useEffect, useCallback } from "react";
import { FirebaseCollectionService } from "../services/CollectionService";

export const useFirebaseCollection = (collectionName = "itemCollection") => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const service = FirebaseCollectionService(collectionName);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const data = await service.fetchAll();
      setItems(data);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to fetch items");
    } finally {
      setLoading(false);
    }
  }, [collectionName]);


  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return { items, loading, error, fetchAll };
};
