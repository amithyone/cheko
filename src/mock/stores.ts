import type { Store } from "@/types";
export const INITIAL_STORES: Store[] = [
  {
    id: "snk-st-01",
    name: "Flagship NY",
    latencyMs: 14,
    status: "ONLINE",
    icon: "router"
  },
  {
    id: "snk-st-02",
    name: "Pop-up LA",
    latencyMs: 42,
    status: "ONLINE",
    icon: "router"
  },
  {
    id: "snk-st-03",
    name: "Warehouse LDN",
    latencyMs: 0,
    status: "RECONNECTING",
    icon: "signal_disconnected"
  },
  {
    id: "snk-st-04",
    name: "Tokyo Boutique",
    latencyMs: 89,
    status: "ONLINE",
    icon: "router"
  }
];
