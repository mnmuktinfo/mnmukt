// import { useQueries } from "@tanstack/react-query";
// import { homepageService } from "../services/homepageService";
// import { useQueryClient } from "@tanstack/react-query";
// export const useHomepageProducts = (sections = []) => {
//   const results = useQueries({
//     queries: sections.map(section => ({
//       queryKey: ["homepage", section.key],
//       queryFn: () => homepageService.getProductsByCollection(section.key, 8),
//       staleTime: 1000 * 60 * 10, // 10 minutes
//       cacheTime: 1000 * 60 * 15, // 15 minutes
//       retry: 1,
//       enabled: !!section.key,
//     }))
//   });

//   const grouped = {};
//   const errors = {};
//   const loadingKeys = [];

//   sections.forEach((section, index) => {
//     const result = results[index];
//     grouped[section.key] = result?.data ?? [];

//     if (result?.isLoading) loadingKeys.push(section.key);
//     if (result?.isError) errors[section.key] = result.error?.message || "Unknown error";
//   });

//   return {
//     products: grouped,
//     loading: results.some(r => r.isLoading),
//     loadingKeys,
//     errors,
//     hasError: Object.keys(errors).length > 0
//   };
// };






import { useQueries, useQueryClient } from "@tanstack/react-query";
import { homepageService } from "../services/homepageService";

export const useHomepageProducts = (sections = []) => {
  const queryClient = useQueryClient();

  const results = useQueries({
    queries: sections.map((section) => ({
      queryKey: ["homepage", section.key],

      queryFn: async () => {
        const data = await homepageService.getProductsByCollection(
          section.key,
          8
        );

        // Store products in product cache
     if (Array.isArray(data)) {
  data.forEach((product) => {
    if (!product) return;

    if (product.slug) {
      queryClient.setQueryData(
        ["products", "slug", product.slug],
        product
      );
    }

    if (product.id) {
      queryClient.setQueryData(
        ["products", "id", product.id],
        product
      );
    }
  });
}

        return data;
      },

      staleTime: 1000 * 60 * 10, // 10 minutes
      cacheTime: 1000 * 60 * 15, // 15 minutes
      retry: 1,
      enabled: !!section.key,
    })),
  });

  const grouped = {};
  const errors = {};
  const loadingKeys = [];

  sections.forEach((section, index) => {
    const result = results[index];

    grouped[section.key] = result?.data ?? [];

    if (result?.isLoading) loadingKeys.push(section.key);

    if (result?.isError) {
      errors[section.key] =
        result.error?.message || "Unknown error";
    }
  });

  return {
    products: grouped,
    loading: results.some((r) => r.isLoading),
    loadingKeys,
    errors,
    hasError: Object.keys(errors).length > 0,
  };
};