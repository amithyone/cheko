export interface Customer {
  id: string;
  name: string;
  email: string;
  visits: number;
  spend: number;
  loyaltyTier: "Elite VIP" | "Preferred" | "Regular" | "New Client";
  favStore: string;
  status: "Active" | "Inactive";
}
