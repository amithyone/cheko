import React from "react";
import { 
  Terminal, 
  LayoutDashboard, 
  Package2, 
  ShoppingCart, 
  Users, 
  HelpCircle, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  Settings,
  Calculator,
  ShieldAlert,
  MessageSquare,
  Truck,
  FolderTree,
  Banknote,
  History
} from "lucide-react";
import { useNotice } from "@/context/NoticeContext";
import { UserRole } from "@/types";
import { DesignerCredit } from "@/shared/layout/DesignerCredit";

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  onLogout?: () => void;
}

export default function Sidebar({ 
  currentTab, 
  setCurrentTab, 
  isCollapsed, 
  setIsCollapsed,
  userRole,
  setUserRole,
  onLogout
}: SidebarProps) {
  const notice = useNotice();

  // Define full list of possible menu options
  const allMenuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["Store Manager"] },
    { id: "inventory", label: "Catalog", icon: Package2, roles: ["Store Manager"] },
    { id: "categories_tags", label: "Categories / Tags", icon: FolderTree, roles: ["Store Manager"] },
    { id: "checkout", label: "Checkout", icon: ShoppingCart, roles: ["Store Manager", "Sales Rep"] },
    { id: "cash_point", label: "Cash Point", icon: Banknote, roles: ["Store Manager", "Cash Point Officer"] },
    { id: "online_orders", label: "Online", icon: Truck, roles: ["Store Manager", "Online Sales Dispatcher"] },
    { id: "order_history", label: "Order History", icon: History, roles: ["Store Manager", "Sales Rep", "Online Sales Dispatcher", "Cash Point Officer"] },
    { id: "customers", label: "Customer", icon: Users, roles: ["Store Manager"] },
    { id: "chat", label: "Intercom", icon: MessageSquare, roles: ["Store Manager", "Online Sales Dispatcher"] },
    { id: "audit", label: "Audit", icon: Calculator, roles: ["Store Manager", "Sales Rep", "Cash Point Officer"] },
    { id: "settings", label: "Settings", icon: Settings, roles: ["Store Manager"] },
  ];

  // Dynamically filter menu options based on selected user clearance role
  const menuItems = allMenuItems.filter(item => item.roles.includes(userRole));

  const handleLogoutPress = () => {
    if (onLogout) {
      onLogout();
    } else {
      notice.showInfo("Session locked. Sign in again to continue.", "Logged out");
    }
  };

  return (
    <aside className={`fixed left-0 top-0 h-screen flex flex-col border-r border-slate-200 bg-white z-40 transition-all duration-300 ${
      isCollapsed ? "w-20 p-4" : "w-64 p-6"
    }`}>
      <div className={`flex items-center ${isCollapsed ? "justify-center" : "justify-between"} px-2 py-6 mb-4 gap-2`}>
        <div className="flex items-center gap-2 overflow-hidden">
          {!isCollapsed && (
            <h1 className="font-display text-lg font-black text-primary tracking-tight select-none">
              cheko
            </h1>
          )}
        </div>
        {!isCollapsed && (
          <button
            onClick={() => setIsCollapsed(true)}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors cursor-pointer"
            title="Collapse Sidebar"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {isCollapsed && (
        <div className="flex justify-center mb-6">
          <button
            onClick={() => setIsCollapsed(false)}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors cursor-pointer"
            title="Expand Sidebar"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      <div className={`${isCollapsed ? "px-1" : "px-2"} mb-6 flex-1 flex flex-col overflow-y-auto no-scrollbar`}>
        {!isCollapsed && (
          <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest px-4 mb-4 select-none">Ecosystem Console</p>
        )}
        <nav className="space-y-1 flex-1">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`w-full flex items-center transition-all duration-300 rounded-lg text-left cursor-pointer ${
                  isCollapsed ? "justify-center px-0 py-3" : "gap-4 px-4 py-3"
                } ${
                  isActive
                    ? "bg-primary/5 text-primary border-r-4 border-primary font-bold"
                    : "text-slate-600 hover:text-primary hover:bg-slate-55 hover:bg-slate-50"
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                <IconComponent className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && (
                  <span className="font-sans text-xs font-semibold whitespace-nowrap transition-opacity duration-300">
                    {item.label}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className={`mt-auto pt-4 border-t border-slate-100 space-y-3 ${isCollapsed ? "px-1" : ""}`}>
          
          {/* Active profile switch banner */}
          {!isCollapsed ? (
            <div className="mb-3 bg-slate-50 border border-slate-200 p-2 rounded-2xl space-y-1.5">
              <span className="block text-[8px] font-extrabold text-slate-400 uppercase tracking-widest text-center">
                Security Profile Swaps
              </span>
              <div className="flex flex-col gap-1 select-none">
                <button 
                  onClick={() => {
                    setUserRole("Store Manager");
                    setCurrentTab("dashboard");
                  }}
                  className={`text-[9px] font-extrabold py-1 rounded transition-all cursor-pointer ${
                    userRole === "Store Manager" 
                      ? "bg-primary text-white shadow-sm" 
                      : "bg-white border border-slate-200 text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Admin Manager
                </button>
                <button 
                  onClick={() => {
                    setUserRole("Sales Rep");
                    setCurrentTab("checkout");
                  }}
                  className={`text-[9px] font-extrabold py-1 rounded transition-all cursor-pointer ${
                    userRole === "Sales Rep" 
                      ? "bg-primary text-white shadow-sm" 
                      : "bg-white border border-slate-200 text-slate-500 hover:text-slate-800"
                  }`}
                >
                  In-Store Cashier
                </button>
                <button 
                  onClick={() => {
                    setUserRole("Online Sales Dispatcher");
                    setCurrentTab("online_orders");
                  }}
                  className={`text-[9px] font-extrabold py-1 rounded transition-all cursor-pointer ${
                    userRole === "Online Sales Dispatcher" 
                      ? "bg-primary text-white shadow-sm" 
                      : "bg-white border border-slate-200 text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Dispatch Officer
                </button>
                <button 
                  onClick={() => {
                    setUserRole("Cash Point Officer");
                    setCurrentTab("cash_point");
                  }}
                  className={`text-[9px] font-extrabold py-1 rounded transition-all cursor-pointer ${
                    userRole === "Cash Point Officer" 
                      ? "bg-primary text-white shadow-sm" 
                      : "bg-white border border-slate-200 text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Cash Point
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => {
                const order: UserRole[] = [
                  "Store Manager",
                  "Sales Rep",
                  "Online Sales Dispatcher",
                  "Cash Point Officer",
                ];
                const idx = order.indexOf(userRole);
                const nextRole = order[(idx + 1) % order.length];
                setUserRole(nextRole);
                const tabByRole: Record<UserRole, string> = {
                  "Store Manager": "dashboard",
                  "Sales Rep": "checkout",
                  "Online Sales Dispatcher": "online_orders",
                  "Cash Point Officer": "cash_point",
                };
                setCurrentTab(tabByRole[nextRole]);
              }}
              className="w-full h-10 flex items-center justify-center rounded-lg hover:bg-slate-50 text-slate-500 hover:text-primary transition-all cursor-pointer"
              title={`Cycle Credentials (Current: ${userRole})`}
            >
              <ShieldAlert className="w-5 h-5 text-indigo-500" />
            </button>
          )}

          <button 
            onClick={() =>
              notice.showInfo(
                "All terminals operating within normal latency parameters.",
                "Support center online"
              )
            }
            className={`w-full text-slate-450 hover:text-primary transition-all flex items-center cursor-pointer ${
              isCollapsed ? "justify-center px-0 py-3" : "gap-4 px-4 py-2"
            } text-left text-xs font-bold`}
            title={isCollapsed ? "Support" : undefined}
          >
            <HelpCircle className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && <span className="font-sans whitespace-nowrap">Support Center</span>}
          </button>
          
          <button 
            onClick={handleLogoutPress}
            className={`w-full text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-all flex items-center cursor-pointer ${
              isCollapsed ? "justify-center px-0 py-3" : "gap-4 px-4 py-2"
            } text-left text-xs font-bold rounded-lg`}
            title={isCollapsed ? "Lock / Logout Console" : undefined}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && <span className="font-sans whitespace-nowrap">Lock Profile</span>}
          </button>
        </div>

        {!isCollapsed && (
          <div className="px-2 pt-3 border-t border-slate-100">
            <DesignerCredit className="text-center leading-relaxed" />
          </div>
        )}
      </div>
    </aside>
  );
}
