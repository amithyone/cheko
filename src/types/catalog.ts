export interface CategoryItem {
  id: string;
  name: string;
  description: string;
  color: string;
}

export interface TagItem {
  id: string;
  name: string;
  color: string;
}

export interface Product {
  sku: string;
  name: string;
  category: string;
  price: number;
  image: string;
  size: string;
  color: string;
  stock: number;
  stockIntegrity: "Optimal" | "Critical";
  segment: "Footwear" | "Apparel" | "Accessories" | "Limited";
  tags?: string[];
  variations?: { id: string; size: string; color: string; stock: number }[];
}

export type BusinessType = "Supermarket" | "Restaurant" | "Services" | "Hotels" | "Flights";
