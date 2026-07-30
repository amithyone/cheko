/**
 * Online orders API
 * Base path: /api/v1/orders/*
 */

import type { DeliveryOrder, OrderHistoryRow } from "@/types";

/** GET /api/v1/orders/history — completed in-store + delivered online */
export async function listOrderHistory(): Promise<OrderHistoryRow[]> {
  throw new Error("Not implemented");
}

export async function listOrders(): Promise<DeliveryOrder[]> {
  throw new Error("Not implemented");
}

export async function createOrder(_order: Omit<DeliveryOrder, "id" | "timestamp">): Promise<DeliveryOrder> {
  throw new Error("Not implemented");
}

export async function updateOrderStatus(
  _id: string,
  _status: DeliveryOrder["status"]
): Promise<DeliveryOrder> {
  throw new Error("Not implemented");
}

export async function assignDriver(_orderId: string, _driver: string): Promise<DeliveryOrder> {
  throw new Error("Not implemented");
}

/** POST /api/v1/orders/:id/settlement/confirm */
export async function confirmOrderPayment(_orderId: string): Promise<{ bankPaid: boolean }> {
  throw new Error("Not implemented — bank settlement webhook");
}
