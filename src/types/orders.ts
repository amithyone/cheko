export interface DeliveryOrder {
  id: string;
  customerName: string;
  phone: string;
  address: string;
  deliveryInstructions: string;
  items: { productName: string; qty: number; unitPrice: number }[];
  total: number;
  status: "PENDING" | "PREPARING" | "OUT_FOR_DELIVERY" | "DELIVERED";
  assignedDriver: string;
  eta: string;
  timestamp: string;
  bankName?: string;
  bankAccountNo?: string;
  bankPaid?: boolean;
}

export type OrderHistoryChannel = "in_store" | "online" | "cash_point";

export interface OrderHistoryRow {
  id: string;
  channel: OrderHistoryChannel;
  summary: string;
  customer?: string;
  amount: number;
  status: "completed" | "delivered" | "refunded";
  source: string;
  timestamp: string;
  items?: { productName: string; qty: number; unitPrice: number }[];
  paymentMethod?: string;
  detailLines?: string[];
}
