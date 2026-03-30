import { useSearchParams } from "react-router-dom";

export function useUrlFilters() {
  const [params, setParams] = useSearchParams();

  const filters = {
    sizes: params.get("size")?.split(",") ?? [],
    colors: params.get("color")?.split(",") ?? [],
    priceMin: params.get("min") ? Number(params.get("min")) : null,
    priceMax: params.get("max") ? Number(params.get("max")) : null,
    search: params.get("q") ?? "",
    sort: params.get("sort") ?? "newest",
  };

  const updateFilters = (next) => {
    const p = new URLSearchParams();

    if (next.sizes?.length) p.set("size", next.sizes.join(","));
    if (next.colors?.length) p.set("color", next.colors.join(","));
    if (next.priceMin) p.set("min", next.priceMin);
    if (next.priceMax) p.set("max", next.priceMax);
    if (next.search) p.set("q", next.search);
    if (next.sort) p.set("sort", next.sort);

    setParams(p);
  };

  return { filters, updateFilters };
}