import { useEffect, useState } from "react";
import Sidebar from "@/shared/layout/Sidebar";
import Header from "@/shared/layout/Header";
import LoginPage from "@/features/auth/pages/LoginPage";
import DashboardPage from "@/features/dashboard/pages/DashboardPage";
import InventoryPage from "@/features/catalog/inventory/pages/InventoryPage";
import CategoryTagsPage from "@/features/catalog/categories/pages/CategoryTagsPage";
import CheckoutPage from "@/features/pos/checkout/pages/CheckoutPage";
import CashPointPage from "@/features/cash-point/pages/CashPointPage";
import CustomersPage from "@/features/customers/pages/CustomersPage";
import OnlineOrdersPage from "@/features/orders/pages/OnlineOrdersPage";
import OrderHistoryPage from "@/features/orders/pages/OrderHistoryPage";
import ManagerChatPage from "@/features/chat/pages/ManagerChatPage";
import AuditPage from "@/features/audit/pages/AuditPage";
import SettingsPage from "@/features/settings/pages/SettingsPage";
import TerminalPayModal from "@/features/pos/terminal/TerminalPayModal";
import { DesignerCredit } from "@/shared/layout/DesignerCredit";
import {
  useAppNavigation,
  useCart,
  useCatalog,
  useChat,
  useTerminalAudits,
  useTransactions,
  useHotelManagement,
  useFlightBooking,
} from "@/hooks";
import type { CashDisbursementRecord, Transaction, UserRole, StaffAccount } from "@/types";
import { INITIAL_STORES, INITIAL_TRANSACTIONS, INITIAL_CASH_POINT_HISTORY, INITIAL_STAFF_ACCOUNTS } from "@/mock";
import type { Store } from "@/types";

export default function AppShell() {
  const [userRole, setUserRole] = useState<UserRole>("Store Manager");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currencySymbol, setCurrencySymbol] = useState("₦");
  const [stores, setStores] = useState<Store[]>(INITIAL_STORES);
  const [cashPointHistory, setCashPointHistory] = useState<CashDisbursementRecord[]>(
    INITIAL_CASH_POINT_HISTORY
  );
  const [staffAccounts, setStaffAccounts] = useState<StaffAccount[]>(INITIAL_STAFF_ACCOUNTS);

  const nav = useAppNavigation();
  const catalog = useCatalog();
  const cart = useCart();
  const chat = useChat();
  const hotel = useHotelManagement();
  const flightBooking = useFlightBooking();
  const { terminalAudits, setTerminalAudits, applyPaymentToTerminal } = useTerminalAudits();
  const { transactions, totalRevenue, setTotalRevenue, appendTransaction } =
    useTransactions(INITIAL_TRANSACTIONS);

  useEffect(() => {
    const revenueInterval = setInterval(() => {
      setTotalRevenue((prev) =>
        prev + (Math.random() > 0.4 ? parseFloat((Math.random() * 80).toFixed(2)) : 0)
      );
    }, 8500);
    return () => clearInterval(revenueInterval);
  }, [setTotalRevenue]);

  const handlePaymentSuccess = (method: string, processedTotal: number) => {
    const productName =
      cart.cart.length > 1
        ? `${cart.cart[0].product.name} & others`
        : cart.cart[0]?.product.name || "Custom Code Pay";

    appendTransaction({
      id: `tx-${Math.floor(Math.random() * 800) + 100}`,
      productName,
      amount: processedTotal,
      terminalName: "TERMINAL_04_ONLINE",
      timestamp: "JUST NOW",
    });

    catalog.decrementStockForCart(
      cart.cart.map((item) => ({ sku: item.product.sku, quantity: item.quantity }))
    );
    applyPaymentToTerminal(method, processedTotal);
    cart.clearCart();
    cart.closeTerminal();
    nav.setCurrentTab("checkout");
  };

  const handleAutoAddTransaction = (productName: string, amount: number) => {
    appendTransaction({
      id: `tx-on-${Math.floor(Math.random() * 800) + 100}`,
      productName,
      amount,
      terminalName: "ONLINE_DELIVERY",
      timestamp: "JUST NOW",
    });
  };

  if (!isAuthenticated) {
    return (
      <LoginPage
        onLoginSuccess={(role) => {
          setIsAuthenticated(true);
          setUserRole(role);
          nav.navigateForRole(role);
        }}
      />
    );
  }

  const headerDetails = nav.getHeaderDetails(userRole, nav.currentTab);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <Sidebar
        currentTab={nav.currentTab}
        setCurrentTab={nav.setCurrentTab}
        isCollapsed={nav.isSidebarCollapsed}
        setIsCollapsed={nav.setIsSidebarCollapsed}
        userRole={userRole}
        setUserRole={setUserRole}
        onLogout={() => setIsAuthenticated(false)}
      />

      <main
        className={`min-h-screen flex flex-col transition-all duration-300 ${nav.isSidebarCollapsed ? "pl-20" : "pl-64"}`}
      >
        <Header
          searchQuery={nav.searchQuery}
          setSearchQuery={nav.setSearchQuery}
          title={headerDetails.title}
          userRole={headerDetails.role}
        />

        <div className="p-8 flex-1">
          {nav.currentTab === "dashboard" && (
            <DashboardPage
              stores={stores}
              setStores={setStores}
              transactions={transactions}
              totalEcosystemRevenue={totalRevenue}
              currencySymbol={currencySymbol}
              terminalAudits={terminalAudits}
              setTerminalAudits={setTerminalAudits}
            />
          )}

          {nav.currentTab === "inventory" && (
            <InventoryPage
              products={catalog.activeProducts}
              setProducts={catalog.setActiveProducts}
              currencySymbol={currencySymbol}
              categories={catalog.categories}
              tags={catalog.tags}
            />
          )}

          {nav.currentTab === "categories_tags" && (
            <CategoryTagsPage
              categories={catalog.categories}
              setCategories={catalog.setCategories}
              tags={catalog.tags}
              setTags={catalog.setTags}
            />
          )}

          {nav.currentTab === "checkout" && (
            <CheckoutPage
              products={catalog.activeProducts}
              cart={cart.cart}
              setCart={cart.setCart}
              onTriggerCharge={cart.triggerCharge}
              businessType={catalog.businessType}
              setBusinessType={catalog.setBusinessType}
              parkedCarts={cart.parkedCarts}
              onParkCart={cart.parkCart}
              onResumeCart={cart.resumeCart}
              onDeleteParkedCart={cart.deleteParkedCart}
              chatMessages={chat.chatMessages}
              onSendChatMessage={chat.sendCashierMessage}
              currencySymbol={currencySymbol}
              hotel={hotel}
              flightBooking={flightBooking}
            />
          )}

          {nav.currentTab === "cash_point" && (
            <CashPointPage
              currencySymbol={currencySymbol}
              terminalAudits={terminalAudits}
              setTerminalAudits={setTerminalAudits}
              transactionHistory={cashPointHistory}
              setTransactionHistory={setCashPointHistory}
              onRecordTransaction={(label, amount) => {
                appendTransaction({
                  id: `tx-cp-${Math.floor(Math.random() * 800) + 100}`,
                  productName: label,
                  amount,
                  terminalName: "CASH_POINT_04",
                  timestamp: "JUST NOW",
                });
              }}
            />
          )}

          {nav.currentTab === "customers" && (
            <CustomersPage currencySymbol={currencySymbol} />
          )}

          {nav.currentTab === "online_orders" && (
            <OnlineOrdersPage
              products={catalog.activeProducts}
              currencySymbol={currencySymbol}
              totalRevenue={totalRevenue}
              setTotalRevenue={setTotalRevenue}
              onAutoAddTransaction={handleAutoAddTransaction}
            />
          )}

          {nav.currentTab === "order_history" && (
            <OrderHistoryPage
              transactions={transactions}
              cashPointHistory={cashPointHistory}
              currencySymbol={currencySymbol}
            />
          )}

          {nav.currentTab === "chat" && (
            <ManagerChatPage
              chatMessages={chat.chatMessages}
              onManagerSend={chat.sendManagerMessage}
              currencySymbol={currencySymbol}
            />
          )}

          {nav.currentTab === "audit" && (
            <AuditPage
              userRole={userRole}
              currencySymbol={currencySymbol}
              terminalAudits={terminalAudits}
              setTerminalAudits={setTerminalAudits}
              transactions={transactions}
            />
          )}

          {nav.currentTab === "settings" && (
            <SettingsPage
              currencySymbol={currencySymbol}
              setCurrencySymbol={setCurrencySymbol}
              businessType={catalog.businessType}
              setBusinessType={catalog.setBusinessType}
              staffAccounts={staffAccounts}
              setStaffAccounts={setStaffAccounts}
              terminalAudits={terminalAudits}
              setTerminalAudits={setTerminalAudits}
            />
          )}
        </div>

        <DesignerCredit variant="footer" />
      </main>

      {cart.isTerminalOpen && (
        <TerminalPayModal
          totalDue={cart.currentDueAmount}
          cart={cart.cart}
          onCancel={cart.closeTerminal}
          onSuccess={handlePaymentSuccess}
          currencySymbol={currencySymbol}
        />
      )}
    </div>
  );
}
