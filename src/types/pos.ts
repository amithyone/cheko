import type { Product } from "./catalog";

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize: string;
}

export interface ParkedCart {
  id: string;
  customerName: string;
  items: CartItem[];
  timestamp: string;
  total: number;
}

export type PaymentMethod = "Cash" | "Bank Transfer" | "NFC/Card" | "Split";
