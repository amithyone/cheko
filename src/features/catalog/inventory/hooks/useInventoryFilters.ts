import { useMemo, useState } from "react";
import { Product } from "@/types";

export function useInventoryFilters(products: Product[]) {
  const [activeSegmentFilter, setActiveSegmentFilter] = useState<string>("All");
  const [searchFilter, setSearchFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [tagFilter, setTagFilter] = useState<string>("All");

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.sku.toLowerCase().includes(searchFilter.toLowerCase()) ||
        product.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
        product.segment.toLowerCase().includes(searchFilter.toLowerCase());

      const matchesCategory =
        categoryFilter === "All" || product.category === categoryFilter;

      const matchesTag =
        tagFilter === "All" || (product.tags?.includes(tagFilter) ?? false);

      if (!matchesSearch || !matchesCategory || !matchesTag) {
        return false;
      }

      if (activeSegmentFilter === "All") {
        return true;
      }
      if (activeSegmentFilter === "Low Stock") {
        return product.stock <= 10;
      }
      return product.segment.toLowerCase() === activeSegmentFilter.toLowerCase();
    });
  }, [products, searchFilter, categoryFilter, tagFilter, activeSegmentFilter]);

  const depletedSkuCount = useMemo(
    () => products.filter((p) => p.stock <= 10).length,
    [products]
  );

  return {
    activeSegmentFilter,
    setActiveSegmentFilter,
    searchFilter,
    setSearchFilter,
    categoryFilter,
    setCategoryFilter,
    tagFilter,
    setTagFilter,
    filteredProducts,
    depletedSkuCount,
  };
}
