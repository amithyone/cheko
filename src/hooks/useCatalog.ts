import { useState, useCallback, useMemo } from "react";
import type { Product, BusinessType, CategoryItem, TagItem } from "@/types";
import {
  SUPERMARKET_PRODUCTS,
  RESTAURANT_PRODUCTS,
  SERVICE_PRODUCTS,
  HOTEL_PRODUCTS,
  FLIGHT_PRODUCTS,
  INITIAL_CATEGORIES,
  INITIAL_TAGS,
} from "@/mock";

const PRODUCT_SETS: Record<BusinessType, Product[]> = {
  Supermarket: SUPERMARKET_PRODUCTS,
  Restaurant: RESTAURANT_PRODUCTS,
  Services: SERVICE_PRODUCTS,
  Hotels: HOTEL_PRODUCTS,
  Flights: FLIGHT_PRODUCTS,
};

export function useCatalog() {
  const [businessType, setBusinessType] = useState<BusinessType>("Supermarket");
  const [productSets, setProductSets] = useState<Record<BusinessType, Product[]>>(PRODUCT_SETS);
  const [categories, setCategories] = useState<CategoryItem[]>(INITIAL_CATEGORIES);
  const [tags, setTags] = useState<TagItem[]>(INITIAL_TAGS);

  const activeProducts = useMemo(
    () => productSets[businessType],
    [businessType, productSets]
  );

  const setActiveProducts = useCallback(
    (updatedOrFn: Product[] | ((prev: Product[]) => Product[])) => {
      setProductSets((prev) => {
        const current = prev[businessType];
        const next = typeof updatedOrFn === "function" ? updatedOrFn(current) : updatedOrFn;
        return { ...prev, [businessType]: next };
      });
    },
    [businessType]
  );

  const decrementStockForCart = useCallback(
    (cartSkus: { sku: string; quantity: number }[]) => {
      setActiveProducts((prevProducts) =>
        prevProducts.map((p) => {
          const match = cartSkus.find((item) => item.sku === p.sku);
          if (match) {
            const decrementedStock = Math.max(0, p.stock - match.quantity);
            return {
              ...p,
              stock: decrementedStock,
              stockIntegrity: decrementedStock <= 10 ? "Critical" : "Optimal",
            };
          }
          return p;
        })
      );
    },
    [setActiveProducts]
  );

  return {
    businessType,
    setBusinessType,
    activeProducts,
    setActiveProducts,
    categories,
    setCategories,
    tags,
    setTags,
    decrementStockForCart,
  };
}
