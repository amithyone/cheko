/**
 * Catalog / inventory API
 * Base path: /api/v1/catalog/*
 */

import type { Product, CategoryItem, TagItem } from "@/types";

export async function listProducts(_businessType?: string): Promise<Product[]> {
  throw new Error("Not implemented");
}

export async function createProduct(_product: Omit<Product, "sku"> & { sku?: string }): Promise<Product> {
  throw new Error("Not implemented");
}

export async function updateProduct(_sku: string, _patch: Partial<Product>): Promise<Product> {
  throw new Error("Not implemented");
}

export async function deleteProduct(_sku: string): Promise<void> {
  throw new Error("Not implemented");
}

export async function listCategories(): Promise<CategoryItem[]> {
  throw new Error("Not implemented");
}

export async function listTags(): Promise<TagItem[]> {
  throw new Error("Not implemented");
}
