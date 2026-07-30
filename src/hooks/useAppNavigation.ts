import { useState, useCallback } from "react";
import type { UserRole } from "@/types";

const ROLE_DEFAULT_TAB: Record<UserRole, string> = {
  "Store Manager": "dashboard",
  "Sales Rep": "checkout",
  "Cash Point Officer": "cash_point",
  "Online Sales Dispatcher": "online_orders",
};

export function useAppNavigation(initialTab = "dashboard") {
  const [currentTab, setCurrentTab] = useState(initialTab);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const navigateForRole = useCallback((role: UserRole) => {
    setCurrentTab(ROLE_DEFAULT_TAB[role]);
  }, []);

  const getHeaderDetails = useCallback(
    (userRole: UserRole, tab: string) => {
      const isRep = userRole === "Sales Rep";
      switch (tab) {
        case "dashboard":
          return { title: "Dashboard", role: "Store Manager" as const };
        case "inventory":
          return { title: "Catalog", role: "Store Manager" as const };
        case "checkout":
          return {
            title: "Checkout",
            role: isRep ? "Payment Point Officer (Terminal 04)" : "Store Manager",
          };
        case "cash_point":
          return { title: "Cash Point", role: "Cash Point Officer" as const };
        case "online_orders":
          return { title: "Online", role: "Store Manager" as const };
        case "order_history":
          return { title: "Order History", role: "Store Manager" as const };
        case "customers":
          return { title: "Customer", role: "Store Manager" as const };
        case "chat":
          return { title: "Intercom", role: "Store Manager" as const };
        case "audit":
          return {
            title: "Audit",
            role: isRep ? "Payment Point Officer" : "Store Manager",
          };
        case "settings":
          return { title: "Settings", role: "Store Manager" as const };
        case "categories_tags":
          return { title: "Categories & Tags", role: "Store Manager" as const };
        default:
          return {
            title: "cheko",
            role: isRep ? "Payment Point Officer" : "Store Manager",
          };
      }
    },
    []
  );

  return {
    currentTab,
    setCurrentTab,
    searchQuery,
    setSearchQuery,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    navigateForRole,
    getHeaderDetails,
  };
}
