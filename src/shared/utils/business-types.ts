import type { BusinessType } from "@/types";

export const BUSINESS_TYPE_OPTIONS: {
  type: BusinessType;
  label: string;
  summary: string;
}[] = [
  { type: "Supermarket", label: "Supermarket", summary: "Produce, dairy & food goods" },
  { type: "Restaurant", label: "Restaurant", summary: "Sides, mains & desserts meals" },
  { type: "Services", label: "Services", summary: "Appointments, repairs & service packages" },
  { type: "Hotels", label: "Hotels", summary: "Rooms, folio billing & guest services" },
  { type: "Flights", label: "Flights", summary: "Search, book & manage flight tickets" },
];

export function getCategoriesForBusinessType(businessType: BusinessType): string[] {
  switch (businessType) {
    case "Supermarket":
      return ["All", "Produce", "Bakery", "Dairy", "Beverages", "Snacks"];
    case "Restaurant":
      return ["All", "Appetizers", "Mains", "Desserts", "Beverages", "Sides"];
    case "Services":
      return ["All", "Consultation", "Repairs", "Membership", "Packages", "Add-ons"];
    case "Hotels":
      return ["All", "Rooms", "Room Service", "Minibar", "Spa & Wellness", "Laundry"];
    case "Flights":
      return ["All", "Baggage", "Insurance", "Meals", "Lounge", "Seats", "Priority"];
    default:
      return ["All"];
  }
}

export function getSearchPlaceholder(businessType: BusinessType): string {
  switch (businessType) {
    case "Supermarket":
      return "Quick search produce, grocery items, or SKU…";
    case "Restaurant":
      return "Quick search menu items, dishes, or SKU…";
    case "Services":
      return "Quick search services, packages, or SKU…";
    case "Hotels":
      return "Quick search rooms, guest charges, or SKU…";
    case "Flights":
      return "Quick search ancillaries — baggage, lounge, seats…";
    default:
      return "Quick search items or SKU…";
  }
}
