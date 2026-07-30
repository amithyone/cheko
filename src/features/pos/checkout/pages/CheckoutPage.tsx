import React, { useState } from "react";
import { Product, CartItem, BusinessType, ParkedCart, ChatMessage, ADMIN_TENDER_OVERRIDE_CODE } from "@/types";
import { AdminUnlockModal } from "../modals/AdminUnlockModal";
import { ParkCartModal } from "../modals/ParkCartModal";
import { CartPanel } from "../components/CartPanel";
import { ProductPicker } from "../components/ProductPicker";
import { IntercomDrawer } from "../components/IntercomDrawer";
import { useCheckoutTotals } from "../hooks/useCheckoutTotals";
import { useNotice } from "@/context/NoticeContext";
import type { HotelManagement } from "@/hooks/useHotelManagement";
import type { FlightBookingManagement } from "@/hooks/useFlightBooking";

interface CheckoutViewProps {
  products: Product[];
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  onTriggerCharge: (tenderedOverride?: number) => void;
  businessType: BusinessType;
  setBusinessType: (type: BusinessType) => void;
  parkedCarts: ParkedCart[];
  onParkCart: (customerName: string) => void;
  onResumeCart: (cart: ParkedCart) => void;
  onDeleteParkedCart: (id: string) => void;
  chatMessages: ChatMessage[];
  onSendChatMessage: (text: string) => void;
  currencySymbol?: string;
  hotel: HotelManagement;
  flightBooking: FlightBookingManagement;
}

export default function CheckoutView({
  products,
  cart,
  setCart,
  onTriggerCharge,
  businessType,
  setBusinessType,
  parkedCarts,
  onParkCart,
  onResumeCart,
  onDeleteParkedCart,
  chatMessages,
  onSendChatMessage,
  currencySymbol = "₦",
  hotel,
  flightBooking,
}: CheckoutViewProps) {
  const notice = useNotice();
  const [keypadInput, setKeypadInput] = useState<string>("");
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [holdCustomerName, setHoldCustomerName] = useState<string>("");
  const [showParkModal, setShowParkModal] = useState<boolean>(false);
  const [isKeypadUnlocked, setIsKeypadUnlocked] = useState(false);
  const [showAdminUnlockModal, setShowAdminUnlockModal] = useState(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState("");

  const { subtotal, tax, total } = useCheckoutTotals(cart);

  const handleAddToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.sku === product.sku);
      if (existing) {
        return prev.map((item) =>
          item.product.sku === product.sku ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1, selectedSize: product.size }];
    });
  };

  const handleAdjustQuantity = (sku: string, operation: "add" | "subtract") => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.sku === sku) {
            const newQty = operation === "add" ? item.quantity + 1 : item.quantity - 1;
            return { ...item, quantity: Math.max(1, newQty) };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const handleRemoveFromCart = (sku: string) => {
    setCart((prev) => prev.filter((item) => item.product.sku !== sku));
  };

  const handleKeypadPress = (val: string) => {
    setKeypadInput((prev) => {
      if (val === "." && prev.includes(".")) return prev;
      return prev + val;
    });
  };

  const handleKeypadBackspace = () => {
    setKeypadInput((prev) => prev.slice(0, -1));
  };

  const handleChargeSubmit = () => {
    if (cart.length === 0) {
      notice.showWarning("Add items to the register before charging.", "Cart is empty");
      return;
    }
    const overrideAmt = isKeypadUnlocked && keypadInput ? parseFloat(keypadInput) : undefined;
    onTriggerCharge(overrideAmt);
  };

  const handleRequestKeypadUnlock = () => {
    setAdminPasswordInput("");
    setShowAdminUnlockModal(true);
  };

  const handleAdminUnlockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPasswordInput.trim().toUpperCase() === ADMIN_TENDER_OVERRIDE_CODE) {
      setIsKeypadUnlocked(true);
      setShowAdminUnlockModal(false);
      setAdminPasswordInput("");
      notice.showToast("Custom tender keypad unlocked", "success");
    } else {
      notice.showError("Invalid manager code. Ask a supervisor to override.", "Access denied");
    }
  };

  const handleLockKeypad = () => {
    setIsKeypadUnlocked(false);
    setKeypadInput("");
    notice.showToast("Custom tender keypad locked", "info");
  };

  const executeParkCart = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    const clientLabel = holdCustomerName.trim() || `Customer #${parkedCarts.length + 1}`;
    onParkCart(clientLabel);
    setHoldCustomerName("");
    setShowParkModal(false);
  };

  return (
    <div className="flex flex-col xl:flex-row h-[calc(100vh-100px)] overflow-hidden -mx-8 -my-8 bg-slate-100/50 relative">

      <ProductPicker
        products={products}
        businessType={businessType}
        onBusinessTypeChange={setBusinessType}
        currencySymbol={currencySymbol}
        onAddToCart={handleAddToCart}
        onSendChatMessage={onSendChatMessage}
        onToggleChat={() => setIsChatOpen((prev) => !prev)}
        chatMessageCount={chatMessages.length}
        onScanningChange={setIsScanning}
        cartItemCount={cart.length}
        cartTotal={total}
        onFolioPosted={() => setCart([])}
        hotel={hotel}
        flightBooking={flightBooking}
      />

      <CartPanel
        cart={cart}
        currencySymbol={currencySymbol}
        isScanning={isScanning}
        parkedCarts={parkedCarts}
        subtotal={subtotal}
        tax={tax}
        total={total}
        isKeypadUnlocked={isKeypadUnlocked}
        keypadInput={keypadInput}
        onShowParkModal={() => setShowParkModal(true)}
        onResumeCart={onResumeCart}
        onDeleteParkedCart={onDeleteParkedCart}
        onAdjustQuantity={handleAdjustQuantity}
        onAddToCart={handleAddToCart}
        onRemoveFromCart={handleRemoveFromCart}
        onKeypadPress={handleKeypadPress}
        onKeypadBackspace={handleKeypadBackspace}
        onRequestKeypadUnlock={handleRequestKeypadUnlock}
        onLockKeypad={handleLockKeypad}
        onCharge={handleChargeSubmit}
      />

      <IntercomDrawer
        isOpen={isChatOpen}
        onOpenChange={setIsChatOpen}
        chatMessages={chatMessages}
        onSendChatMessage={onSendChatMessage}
      />

      <ParkCartModal
        open={showParkModal}
        customerName={holdCustomerName}
        onCustomerNameChange={setHoldCustomerName}
        onSubmit={executeParkCart}
        onClose={() => setShowParkModal(false)}
      />

      <AdminUnlockModal
        open={showAdminUnlockModal}
        value={adminPasswordInput}
        onChange={setAdminPasswordInput}
        onSubmit={handleAdminUnlockSubmit}
        onClose={() => setShowAdminUnlockModal(false)}
      />

    </div>
  );
}
