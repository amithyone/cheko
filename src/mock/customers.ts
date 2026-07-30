import type { Customer } from "@/types";

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: "CST-902",
    name: "Marcus Aurelius",
    email: "marcus.a@stoic.org",
    visits: 48,
    spend: 2950.0,
    loyaltyTier: "Elite VIP",
    favStore: "Flagship NY",
    status: "Active",
  },
  {
    id: "CST-903",
    name: "Sophia Sterling",
    email: "sophia@sterling.io",
    visits: 12,
    spend: 890.0,
    loyaltyTier: "Preferred",
    favStore: "Lekki Mall",
    status: "Active",
  },
];
