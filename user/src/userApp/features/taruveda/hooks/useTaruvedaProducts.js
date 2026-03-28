import { useQuery } from "@tanstack/react-query";
import { taruvedaService } from "../services/taruvedaService";

const STALE = {
  products: 1000 * 60 * 10, // 10 min
};

export const useTaruvedaProducts = () => {
  const {
    data: products = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["taruveda", "products"],
    queryFn: () => taruvedaService.getProducts(),
    staleTime: STALE.products,
    retry: 1,
  });

  return {
    products,
    isLoading,
    isError,
    error: error?.message ?? null,
  };
};