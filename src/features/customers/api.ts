/**
 * Customers API — /api/v1/customers/*
 */
import type { Customer } from "@/types";

export async function listCustomers(): Promise<Customer[]> {
  throw new Error("Not implemented");
}

export async function createCustomer(_customer: Omit<Customer, "id">): Promise<Customer> {
  throw new Error("Not implemented");
}
