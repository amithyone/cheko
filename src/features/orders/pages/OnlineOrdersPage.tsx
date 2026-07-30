import React, { useState } from "react";
import {
  Truck,
  Clock,
  FilePlus,
  CheckCircle2,
  Search,
  Info,
  Layers,
  Send,
  Database,
} from "lucide-react";
import { Product, DeliveryOrder } from "@/types";
import { useNotice } from "@/context/NoticeContext";
import { usePaymentProvider } from "@/context/PaymentProviderContext";
import { INITIAL_ONLINE_ORDERS, ORDER_BANKS, ORDER_DRIVERS } from "@/mock";
import { OrderCard } from "../components/OrderCard";
import { ModalCartItem } from "../components/OrderBuilder";
import { NewOrderModal } from "../modals/NewOrderModal";
import { SettlementModal } from "../modals/SettlementModal";
import { SettlementSuccessModal } from "../modals/SettlementSuccessModal";
import { QuickSearchStoreModal } from "../modals/QuickSearchStoreModal";

interface OnlineOrdersPageProps {
  products: Product[];
  currencySymbol: string;
  totalRevenue: number;
  setTotalRevenue: React.Dispatch<React.SetStateAction<number>>;
  onAutoAddTransaction?: (productName: string, amount: number) => void;
}

export default function OnlineOrdersPage({
  products,
  currencySymbol,
  totalRevenue,
  setTotalRevenue,
  onAutoAddTransaction,
}: OnlineOrdersPageProps) {
  const notice = useNotice();
  const { adapter } = usePaymentProvider();
  const [activeTab, setActiveTab] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);

  const [onlineOrders, setOnlineOrders] = useState<DeliveryOrder[]>(INITIAL_ONLINE_ORDERS);

  const [custName, setCustName] = useState("");
  const [custPhone, setCustPhone] = useState("");
  const [custAddress, setCustAddress] = useState("");
  const [custInstructions, setCustInstructions] = useState("");
  const [selectedProductSku, setSelectedProductSku] = useState(products[0]?.sku || "");
  const [itemQty, setItemQty] = useState("1");
  const [modalCart, setModalCart] = useState<ModalCartItem[]>([]);
  const [isQuickSearchOpen, setIsQuickSearchOpen] = useState(false);
  const [quickSearchQuery, setQuickSearchQuery] = useState("");

  const [selectedBank, setSelectedBank] = useState<string>("Sterling Bank");
  const [settlementOrder, setSettlementOrder] = useState<DeliveryOrder | null>(null);
  const [settlementSuccessOrder, setSettlementSuccessOrder] = useState<DeliveryOrder | null>(null);
  const [isVerifyingTransfer, setIsVerifyingTransfer] = useState<boolean>(false);
  const [settlementCopyHint, setSettlementCopyHint] = useState("");

  const [simulatedCustomer, setSimulatedCustomer] = useState("David Alao");
  const [simulatedItemSku, setSimulatedItemSku] = useState(products[0]?.sku || "");
  const [simulatedStorefrontQty, setSimulatedStorefrontQty] = useState("2");
  const [simulatedStorefrontLogs, setSimulatedStorefrontLogs] = useState<string>("");

  const driversList = ORDER_DRIVERS;
  const banksList = ORDER_BANKS;

  const generateNubanAccount = (idString: string) => {
    const numbersOnly = idString.replace(/[^0-9]/g, "");
    if (!numbersOnly) return "5013948293";
    const pad = numbersOnly.padEnd(6, "5");
    return "90" + pad.substring(0, 8);
  };

  const formatSettlementDetails = (order: DeliveryOrder) => {
    const amount = `${currencySymbol}${order.total.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
    return [
      "cheko — Payment transfer details",
      `Order: ${order.id}`,
      `Amount payable: ${amount}`,
      `Bank: ${order.bankName}`,
      `Account number: ${order.bankAccountNo}`,
      `Account title: cheko: ${order.customerName}`,
      `Gateway ID: WG-${order.id}`,
      order.items.length > 0
        ? `Items: ${order.items.map((i) => `${i.productName} x${i.qty}`).join(", ")}`
        : "",
    ]
      .filter(Boolean)
      .join("\n");
  };

  const showSettlementCopyHint = (message: string) => {
    setSettlementCopyHint(message);
    setTimeout(() => setSettlementCopyHint(""), 2500);
  };

  const handleCopySettlementDetails = async (order: DeliveryOrder) => {
    const text = formatSettlementDetails(order);
    try {
      await navigator.clipboard.writeText(text);
      showSettlementCopyHint("Payment details copied to clipboard");
    } catch {
      showSettlementCopyHint("Could not copy — select text manually");
    }
  };

  const handleShareSettlementDetails = async (order: DeliveryOrder) => {
    const text = formatSettlementDetails(order);
    if (navigator.share) {
      try {
        await navigator.share({
          title: `cheko payment — Order ${order.id}`,
          text,
        });
        return;
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
      }
    }
    await handleCopySettlementDetails(order);
    showSettlementCopyHint("Details copied — paste to share");
  };

  const handleCopyAccountNumber = async (accountNo: string) => {
    try {
      await navigator.clipboard.writeText(accountNo);
      showSettlementCopyHint("Account number copied");
    } catch {
      showSettlementCopyHint("Could not copy — select text manually");
    }
  };

  const addProductToModalCart = (prod: Product, qty?: number) => {
    const qtyNum = qty ?? (parseInt(itemQty) || 1);
    if (qtyNum <= 0) {
      notice.showWarning("Quantity must be greater than zero.", "Invalid quantity");
      return;
    }
    const existingIdx = modalCart.findIndex((item) => item.product.sku === prod.sku);
    if (existingIdx > -1) {
      const updated = [...modalCart];
      updated[existingIdx].qty += qtyNum;
      setModalCart(updated);
    } else {
      setModalCart((prev) => [...prev, { product: prod, qty: qtyNum }]);
    }
    setItemQty("1");
    setSelectedProductSku(prod.sku);
  };

  const handleAddCartItemInModal = () => {
    const prod = products.find((p) => p.sku === selectedProductSku);
    if (!prod) {
      notice.showWarning("No valid item selected.", "Select a product");
      return;
    }
    addProductToModalCart(prod);
  };

  const handleRemoveCartItemInModal = (sku: string) => {
    setModalCart((prev) => prev.filter((item) => item.product.sku !== sku));
  };

  const computedModalCartTotal = modalCart.reduce((acc, curr) => acc + curr.product.price * curr.qty, 0);

  const handleInitiateNewOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!custName || !custPhone || !custAddress) {
      notice.showWarning(
        "Recipient name, phone number, and delivery address are required.",
        "Missing delivery details"
      );
      return;
    }
    if (modalCart.length === 0) {
      notice.showWarning(
        "Add at least one product to the order list before continuing.",
        "Cart is empty"
      );
      return;
    }

    const orderId = `ON-${Math.floor(Math.random() * 9000) + 1000}`;
    let bankName = selectedBank;
    let bankAccountNo = generateNubanAccount(orderId);

    try {
      const va = await adapter.createVirtualAccount(computedModalCartTotal, orderId, custName);
      bankName = va.bankName;
      bankAccountNo = va.accountNumber;
    } catch {
      /* fallback to mock NUBAN */
    }

    const newOrderPendingPayment: DeliveryOrder = {
      id: orderId,
      customerName: custName,
      phone: custPhone,
      address: custAddress,
      deliveryInstructions: custInstructions || "Deliver safely to door.",
      items: modalCart.map((c) => ({
        productName: c.product.name,
        qty: c.qty,
        unitPrice: c.product.price,
      })),
      total: computedModalCartTotal,
      status: "PENDING",
      assignedDriver: "None Assigned",
      eta: "Awaiting API Payment Confirmation",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      bankName,
      bankAccountNo,
      bankPaid: false,
    };

    setSettlementOrder(newOrderPendingPayment);
  };

  const handleConfirmTransferAlertSimulation = async () => {
    if (!settlementOrder) return;
    setIsVerifyingTransfer(true);

    try {
      await adapter.verifyTransfer(settlementOrder.id, settlementOrder.total);
    } catch {
      /* demo continues */
    }

    setTimeout(() => {
      const settledOrder: DeliveryOrder = {
        ...settlementOrder,
        bankPaid: true,
        eta: "Pending Logistics Dispatch Check",
      };

      setOnlineOrders((prev) => [settledOrder, ...prev]);
      setIsVerifyingTransfer(false);

      setCustName("");
      setCustPhone("");
      setCustAddress("");
      setCustInstructions("");
      setModalCart([]);
      setSettlementOrder(null);
      setIsNewOrderModalOpen(false);
      setSettlementSuccessOrder(settledOrder);
    }, 1500);
  };

  const handleTriggerSimulatedStorefrontWebhook = () => {
    const chosenProd = products.find((p) => p.sku === simulatedItemSku) || products[0];
    if (!chosenProd) {
      notice.showWarning("No items in active inventory to simulate.", "Inventory empty");
      return;
    }

    const qtyVal = parseInt(simulatedStorefrontQty) || 1;
    const totalCost = chosenProd.price * qtyVal;
    const mockOrderId = `ON-WEB-${Math.floor(Math.random() * 8000) + 1000}`;
    const mockAccNo = generateNubanAccount(mockOrderId);

    const mockPayloadJSON = JSON.stringify(
      {
        event: "order.created",
        storefront: "cheko-headless-shopify",
        order_id: mockOrderId,
        client: {
          fullname: simulatedCustomer,
          phone_contact: "+234 815 678 9021",
          shipping: "Floor 3, Block 2, Centenary Tower, Central Area, Abuja",
        },
        cart_manifest: [
          { sku: chosenProd.sku, name: chosenProd.name, quantity: qtyVal, pricing: chosenProd.price },
        ],
        total_checkout: totalCost,
        settlement_gateway: "Flutterwave-Pay-To-Account",
      },
      null,
      2
    );

    setSimulatedStorefrontLogs(mockPayloadJSON);

    const apiOrder: DeliveryOrder = {
      id: mockOrderId,
      customerName: simulatedCustomer,
      phone: "+234 815 678 9021",
      address: "Floor 3, Block 2, Centenary Tower, Central Area, Abuja",
      deliveryInstructions: "Imported via Web storefront API callback",
      items: [{ productName: chosenProd.name, qty: qtyVal, unitPrice: chosenProd.price }],
      total: totalCost,
      status: "PENDING",
      assignedDriver: "None Assigned",
      eta: "Pending Dispatcher Confirmation",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      bankName: "Providus Bank Gateway",
      bankAccountNo: mockAccNo,
      bankPaid: true,
    };

    setOnlineOrders((prev) => [apiOrder, ...prev]);

    const customers = ["Ngozi Eze", "Alhaji Sanusi", "Obinna Vance", "Yinka Martins"];
    setSimulatedCustomer(customers[Math.floor(Math.random() * customers.length)]);

    notice.showSuccess(
      `Order ${mockOrderId} created. Payment processed and logistics notified.`,
      "API ingress confirmed"
    );
  };

  const handlePromoteStatus = (orderId: string, nextStatus: "PREPARING" | "OUT_FOR_DELIVERY" | "DELIVERED") => {
    setOnlineOrders((prev) =>
      prev.map((order) => {
        if (order.id === orderId) {
          let assignedD = order.assignedDriver;
          let finalEta = order.eta;

          if (nextStatus === "PREPARING") {
            finalEta = "Assembling items inside warehouse bins";
          } else if (nextStatus === "OUT_FOR_DELIVERY") {
            assignedD = driversList[Math.floor(Math.random() * driversList.length)];
            finalEta = "18 mins away from target destination";
          } else if (nextStatus === "DELIVERED") {
            finalEta = "Completed securely";
            setTotalRevenue((prev) => prev + order.total);
            if (onAutoAddTransaction) {
              onAutoAddTransaction(`${order.customerName} (Online Order ${order.id})`, order.total);
            }
          }

          return {
            ...order,
            status: nextStatus,
            assignedDriver: assignedD,
            eta: finalEta,
          };
        }
        return order;
      })
    );

    const statusLabel = nextStatus.replace(/_/g, " ");
    notice.showSuccess(`Order ${orderId} is now ${statusLabel}.`, "Order status updated");
  };

  const handleAssignDriver = (orderId: string, driver: string) => {
    setOnlineOrders((prev) =>
      prev.map((order) => {
        if (order.id === orderId) {
          return {
            ...order,
            assignedDriver: driver,
            eta: "15 mins (Rider assigned)",
          };
        }
        return order;
      })
    );
    notice.showSuccess(`Order ${orderId} assigned to ${driver}.`, "Driver assigned");
  };

  const handleCloseNewOrderModal = () => {
    setIsNewOrderModalOpen(false);
    setModalCart([]);
  };

  const handleOpenQuickSearch = () => {
    setQuickSearchQuery("");
    setIsQuickSearchOpen(true);
  };

  const filteredOrders = onlineOrders.filter((order) => {
    const matchesSearch =
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.address.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeTab === "All") return matchesSearch;
    return matchesSearch && order.status === activeTab;
  });

  const pendingCount = onlineOrders.filter((o) => o.status === "PENDING").length;
  const preparingCount = onlineOrders.filter((o) => o.status === "PREPARING").length;
  const deliveryCount = onlineOrders.filter((o) => o.status === "OUT_FOR_DELIVERY").length;
  const deliveredCount = onlineOrders.filter((o) => o.status === "DELIVERED").length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-150 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse"></span>
            <span className="text-[10px] font-extrabold text-indigo-700 uppercase tracking-[0.2em] font-mono">
              Online Dispatch & Sync Logistics
            </span>
          </div>
          <h2 className="font-display font-black text-2xl sm:text-3xl text-slate-900 leading-none">
            Online Orders Hub
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-medium font-sans">
            Take manual delivery requests with shopping lists, copy mock bank settlement codes, and inspect API storefront webhook relays.
          </p>
        </div>

        <div>
          <button
            onClick={() => setIsNewOrderModalOpen(true)}
            className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition-all shadow-md shadow-indigo-150 cursor-pointer"
          >
            <FilePlus className="w-4 h-4" /> Take Multi-Item Order
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-slate-350 transition-all flex flex-col justify-between">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Awaiting Confirm</span>
            <Clock className="w-4 h-4 text-rose-500" />
          </div>
          <div className="mt-3">
            <h3 className={`text-2xl font-black font-display leading-[1.15] ${pendingCount > 0 ? "text-rose-600" : "text-slate-800"}`}>
              {pendingCount} orders
            </h3>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-1">Pending dispatcher check</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-slate-350 transition-all flex flex-col justify-between">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">In Kitchen/Packing</span>
            <Layers className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black font-display text-slate-800 leading-[1.15]">
              {preparingCount} packing
            </h3>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-1">Readying for cargo bins</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-slate-350 transition-all flex flex-col justify-between">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Dispatched Cargo</span>
            <Truck className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="mt-3">
            <h3 className={`text-2xl font-black font-display leading-[1.15] ${deliveryCount > 0 ? "text-indigo-600" : "text-slate-800"}`}>
              {deliveryCount} on route
            </h3>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-1">couriers en-route</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-slate-350 transition-all flex flex-col justify-between">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Completed Today</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black font-display text-emerald-600 leading-[1.15]">
              {deliveredCount} completed
            </h3>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-1 font-sans">verified inside cashflows</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">
        <div className="xl:col-span-1 space-y-6">
          <div className="bg-white border border-slate-150 p-5 rounded-2xl space-y-3">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Search Channels</h4>
            <div className="relative">
              <span className="absolute left-3 top-3.5 text-slate-400">
                <Search className="w-3.5 h-3.5" />
              </span>
              <input
                type="text"
                placeholder="Search ID, address, client..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <div className="space-y-1 pt-2">
              {[
                { label: "All Active Orders", key: "All" },
                { label: "Awaiting Check", key: "PENDING" },
                { label: "Assembling / Packing", key: "PREPARING" },
                { label: "Out with Riders", key: "OUT_FOR_DELIVERY" },
                { label: "Completed Deliveries", key: "DELIVERED" },
              ].map((tab) => {
                const isActive = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`w-full text-left py-2 px-3 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                      isActive
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "bg-slate-50 text-slate-600 hover:bg-slate-100 border-transparent"
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center gap-1.5 border-b border-slate-800 pb-2.5">
              <Database className="w-4 h-4 text-emerald-400 animate-pulse" />
              <div>
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Headless API Storefront</h4>
                <p className="text-[9px] text-emerald-400">SIMULATION GATEWAY</p>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed font-semibold">
              Customers on external websites can buy products which trigger a webhook to this app. Choose options and simulate an incoming API order!
            </p>

            <div className="space-y-2.5 text-xs text-slate-300 font-semibold font-mono">
              <div>
                <label className="block text-[8px] uppercase text-slate-400 mb-1">Simulate Customer</label>
                <input
                  type="text"
                  value={simulatedCustomer}
                  onChange={(e) => setSimulatedCustomer(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-[11px] text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-[8px] uppercase text-slate-400 mb-1">Target Product SKU</label>
                <select
                  value={simulatedItemSku}
                  onChange={(e) => setSimulatedItemSku(e.target.value)}
                  className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-[11px] text-white overflow-ellipsis"
                >
                  {products.map((p) => (
                    <option key={p.sku} value={p.sku} className="bg-slate-900">
                      {p.name.substring(0, 24)}...
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[8px] uppercase text-slate-400 mb-1">Store Buy Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={simulatedStorefrontQty}
                  onChange={(e) => setSimulatedStorefrontQty(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-[11px] text-white"
                />
              </div>

              <button
                type="button"
                onClick={handleTriggerSimulatedStorefrontWebhook}
                className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-extrabold text-[10px] uppercase rounded-lg active:scale-95 transition-all flex items-center justify-center gap-1.5 mt-2 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" /> Simulate API Webhook Ingress
              </button>
            </div>

            {simulatedStorefrontLogs && (
              <div className="space-y-1.5">
                <span className="text-[9px] text-slate-400 block font-mono">LATEST API PAYLOAD POSTED:</span>
                <pre className="p-2.5 bg-black rounded-lg text-[9px] font-mono text-emerald-400 max-h-40 overflow-y-auto no-scrollbar border border-slate-850">
                  {simulatedStorefrontLogs}
                </pre>
              </div>
            )}
          </div>

          <div className="p-4 bg-white border border-slate-205 rounded-2xl text-[11px] leading-relaxed text-slate-500 font-medium">
            <div className="flex items-center gap-1.5 font-bold text-slate-800 uppercase text-[10px] tracking-wider mb-2">
              <Info className="w-3.5 h-3.5 text-indigo-550" />
              Logistics Manual
            </div>
            1. Create customized delivery orders using the multi-item constructor.<br />
            2. Real-time NUBAN accounts are generated based on choice of local Nigerian bank gateways.<br />
            3. Dispatched cargo features step milestones and driver handoff logs automatically.
          </div>
        </div>

        <div className="xl:col-span-3 space-y-4">
          {filteredOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              currencySymbol={currencySymbol}
              driversList={driversList}
              onPromoteStatus={handlePromoteStatus}
              onAssignDriver={handleAssignDriver}
            />
          ))}

          {filteredOrders.length === 0 && (
            <div className="bg-white rounded-3xl border border-slate-150 p-12 text-center text-slate-400 space-y-3">
              <Truck className="w-12 h-12 text-slate-300 mx-auto animate-bounce" />
              <p className="text-sm font-bold font-sans">No online orders found in active channels.</p>
            </div>
          )}
        </div>
      </div>

      <NewOrderModal
        open={isNewOrderModalOpen}
        products={products}
        currencySymbol={currencySymbol}
        banksList={banksList}
        custName={custName}
        onCustNameChange={setCustName}
        custPhone={custPhone}
        onCustPhoneChange={setCustPhone}
        custAddress={custAddress}
        onCustAddressChange={setCustAddress}
        custInstructions={custInstructions}
        onCustInstructionsChange={setCustInstructions}
        selectedProductSku={selectedProductSku}
        onSelectedProductSkuChange={setSelectedProductSku}
        itemQty={itemQty}
        onItemQtyChange={setItemQty}
        modalCart={modalCart}
        selectedBank={selectedBank}
        onSelectedBankChange={setSelectedBank}
        computedModalCartTotal={computedModalCartTotal}
        onAddCartItem={handleAddCartItemInModal}
        onRemoveCartItem={handleRemoveCartItemInModal}
        onOpenQuickSearch={handleOpenQuickSearch}
        onSubmit={handleInitiateNewOrder}
        onClose={handleCloseNewOrderModal}
      />

      {settlementOrder && (
        <SettlementModal
          order={settlementOrder}
          currencySymbol={currencySymbol}
          settlementCopyHint={settlementCopyHint}
          isVerifyingTransfer={isVerifyingTransfer}
          onClose={() => setSettlementOrder(null)}
          onCopyDetails={handleCopySettlementDetails}
          onShareDetails={handleShareSettlementDetails}
          onCopyAccountNumber={handleCopyAccountNumber}
          onConfirmTransfer={handleConfirmTransferAlertSimulation}
        />
      )}

      {settlementSuccessOrder && (
        <SettlementSuccessModal
          order={settlementSuccessOrder}
          currencySymbol={currencySymbol}
          onClose={() => setSettlementSuccessOrder(null)}
        />
      )}

      <QuickSearchStoreModal
        open={isQuickSearchOpen}
        products={products}
        quickSearchQuery={quickSearchQuery}
        onQuickSearchQueryChange={setQuickSearchQuery}
        itemQty={itemQty}
        modalCartLength={modalCart.length}
        onAddProduct={addProductToModalCart}
        onClose={() => setIsQuickSearchOpen(false)}
      />
    </div>
  );
}
