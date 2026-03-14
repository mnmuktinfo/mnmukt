import { useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { homepageService } from "../services/homepageService";

// These override the global default staleTime per query type
const STALE = {
  products:     1000 * 60 * 10,  // 10 min — products change more often
  categories:   1000 * 60 * 60,  // 1 hour
  collections:  1000 * 60 * 60,  // 1 hour
  testimonials: 1000 * 60 * 30,  // 30 min
};

export const useHomepageProducts = (sections = []) => {
  const queryClient = useQueryClient();

  const productResults = useQueries({
    queries: sections.map((section) => ({
      queryKey: ["homepage", "products", section.key],
      queryFn: async () => {
        const data = await homepageService.getProductsByCollection(section.key, 8);
        if (Array.isArray(data)) {
          data.forEach((product) => {
            if (!product?.id) return;
            queryClient.setQueryData(["products", "id", product.id], (old) => old ?? product);
            if (product.slug) {
              queryClient.setQueryData(["products", "slug", product.slug], (old) => old ?? product);
            }
          });
        }
        return data ?? [];
      },
      staleTime: STALE.products,
      retry: 1,
      enabled: !!section.key,
    })),
  });

  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ["homepage", "categories"],
    queryFn:  () => homepageService.getHomepageCategories(),
    staleTime: STALE.categories,
    retry: 1,
  });

  const { data: testimonials = [], isLoading: testimonialsLoading } = useQuery({
    queryKey: ["homepage", "testimonials"],
    queryFn:  () => homepageService.getTestimonials(),
    staleTime: STALE.testimonials,
    retry: 1,
  });

  const { data: collections = [], isLoading: collectionsLoading } = useQuery({
    queryKey: ["homepage", "collections"],
    queryFn:  () => homepageService.getCollections(),
    staleTime: STALE.collections,
    retry: 1,
  });

  const products = {};
  const errors = {};
  const loadingKeys = [];

  sections.forEach((section, i) => {
    const r = productResults[i];
    products[section.key] = r?.data ?? [];
    if (r?.isLoading) loadingKeys.push(section.key);
    if (r?.isError)   errors[section.key] = r.error?.message ?? "Failed to load";
  });

  return {
    products,
    categories,
    testimonials,
    collections,
    loading:
      productResults.some((r) => r.isLoading) ||
      categoriesLoading ||
      testimonialsLoading ||
      collectionsLoading,
    loadingKeys,
    errors,
    hasError: Object.keys(errors).length > 0,
  };
};