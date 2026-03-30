/**
 * useCategories.js
 *
 * React Query hooks for category data — categories only.
 *
 * Exports:
 *   useCategories     — all categories list (paginated, first page)
 *   useCategoryById   — single category by Firestore ID
 */

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { categoryService } from "../services/categoriesService";

/* ─────────────────────────────────────────────────────────
   QUERY KEYS  (mirrors categoriesService CATEGORY_KEYS)
───────────────────────────────────────────────────────── */
export const CATEGORY_KEYS = {
  all:   ()   => ["categories", "all"],
  byId:  (id) => ["categories", "id", String(id)],
};

/* ─────────────────────────────────────────────────────────
   SHARED CONFIG
───────────────────────────────────────────────────────── */
const STALE = 15 * 60 * 1000; // 15 min — categories change rarely
const GC    = 30 * 60 * 1000; // 30 min gc

const Q_OPTS = {
  staleTime:            STALE,
  gcTime:               GC,
  refetchOnMount:       false,
  refetchOnWindowFocus: false,
  refetchOnReconnect:   "always",
  retry:                2,
};

/* ─────────────────────────────────────────────────────────
   useCategories
   Returns all categories ordered by createdAt desc.
   Includes prefetchById helper for hover optimizations.
───────────────────────────────────────────────────────── */
export const useCategories = () => {
  const qc = useQueryClient();

  const query_ = useQuery({
    queryKey: CATEGORY_KEYS.all(),
    queryFn:  async () => {
      const res = await categoryService.fetchCategories();
      if (res.error) throw new Error(res.error);
      return res; // { data, lastCursor, hasMore } — all plain/serializable
    },
    ...Q_OPTS,
  });

  /* Prefetch a single category on card hover — zero wait on click */
  const prefetchById = useCallback((id) => {
    if (!id) return;
    qc.prefetchQuery({
      queryKey: CATEGORY_KEYS.byId(id),
      queryFn:  async () => {
        const res = await categoryService.getCategoryById(id);
        if (res.error) throw new Error(res.error);
        return res.data;
      },
      staleTime: STALE,
    });
  }, [qc]);

  return {
    categories:  query_.data?.data        ?? [],
    lastCursor:  query_.data?.lastCursor  ?? null,  // plain { id, createdAt } — IDB-safe
    hasMore:     query_.data?.hasMore     ?? false,
    isLoading:   query_.isLoading,
    isFetching:  query_.isFetching,
    isError:     query_.isError,
    error:       query_.error,
    refetch:     query_.refetch,
    prefetchById,
  };
};

/* ─────────────────────────────────────────────────────────
   useCategoryById
───────────────────────────────────────────────────────── */
export const useCategoryById = (id) =>
  useQuery({
    queryKey: CATEGORY_KEYS.byId(id),
    queryFn:  async () => {
      const res = await categoryService.getCategoryById(id);
      if (res.error) throw new Error(res.error);
      return res.data; // normalized category object
    },
    enabled: !!id,
    ...Q_OPTS,
  });