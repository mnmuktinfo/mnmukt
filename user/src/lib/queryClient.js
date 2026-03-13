import { QueryClient } from "@tanstack/react-query";
import { get, set, del } from "idb-keyval";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 10, // 10 min
      gcTime: 1000 * 60 * 60, // 1 hour
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: false,
    },
  },
});

// IndexedDB persister
export const idbPersister = {
  persistClient: async (client) => {
    await set("REACT_QUERY_CACHE", client);
  },
  restoreClient: async () => {
    return await get("REACT_QUERY_CACHE");
  },
  removeClient: async () => {
    await del("REACT_QUERY_CACHE");
  },
};