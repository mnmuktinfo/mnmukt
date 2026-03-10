import { useState, useEffect, useCallback } from "react";
import { FirebaseCollectionService } from "../services/firebase/collectionService";

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

  const addItem = async ({ name, imageUrl }) => {
    try {
      const newItem = await service.addItem({ name, imageUrl });
      setItems(prev => [...prev, newItem]);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to add item");
    }
  };

  const deleteItem = async (id) => {
    try {
      await service.deleteItem(id);
      setItems(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to delete item");
    }
  };

  const updateItem = async (id, { name, imageUrl }) => {
    try {
      const updatedData = await service.updateItem(id, { name, imageUrl });
      setItems(prev => prev.map(i => (i.id === id ? { ...i, ...updatedData } : i)));
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to update item");
    }
  };

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return { items, loading, error, fetchAll, addItem, deleteItem, updateItem };
};
