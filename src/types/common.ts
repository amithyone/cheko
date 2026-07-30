export interface Store {
  id: string;
  name: string;
  latencyMs: number;
  status: "ONLINE" | "RECONNECTING" | "OFFLINE";
  icon: string;
}

export interface RegionSummary {
  name: string;
  revenue: string;
  growth: string;
  isPositive: boolean;
  percentage: number;
}
