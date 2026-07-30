import type { DisputeTicket } from "@/types";

export const INITIAL_DISPUTES: DisputeTicket[] = [
  {
    id: "DSP-441",
    terminal: "Terminal 02",
    type: "OVERCHARGE",
    description: "Customer billed twice for same SKU scan",
    amount: 4500,
    status: "PENDING",
    timestamp: "09:12 AM",
  },
  {
    id: "DSP-442",
    terminal: "Terminal 04",
    type: "REFUND",
    description: "Partial refund requested — damaged packaging",
    amount: 2800,
    status: "PENDING",
    timestamp: "10:45 AM",
  },
];
