import { useState, useCallback } from "react";
import type { CartItem, ParkedCart } from "@/types";
import { computeCartTotals } from "@/shared/utils/cart-totals";
import { roundMoney } from "@/shared/utils/money";

/** Amount + items locked when cashier taps Execute Payment. */
export interface ChargeSnapshot {
  amount: number;
  itemCount: number;
}

export function useCart() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [parkedCarts, setParkedCarts] = useState<ParkedCart[]>([]);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [chargeSnapshot, setChargeSnapshot] = useState<ChargeSnapshot | null>(null);

  const { subtotal, tax, total, itemCount } = computeCartTotals(cart);

  const triggerCharge = useCallback(
    (tenderedAmt?: number, itemsOverride?: CartItem[]) => {
      const source = itemsOverride ?? cart;
      const live = computeCartTotals(source);
      const amount =
        tenderedAmt !== undefined ? roundMoney(tenderedAmt) : live.total;
      setChargeSnapshot({
        amount,
        itemCount: live.itemCount,
      });
      setIsTerminalOpen(true);
    },
    [cart]
  );

  const closeTerminal = useCallback(() => {
    setIsTerminalOpen(false);
    setChargeSnapshot(null);
  }, []);

  const parkCart = useCallback(
    (customerName: string) => {
      if (cart.length === 0) return;
      const newParked: ParkedCart = {
        id: `parked-${Date.now()}`,
        customerName,
        items: [...cart],
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        total,
      };
      setParkedCarts((prev) => [newParked, ...prev]);
      setCart([]);
    },
    [cart, total]
  );

  const resumeCart = useCallback((parked: ParkedCart) => {
    setCart(parked.items);
    setParkedCarts((prev) => prev.filter((c) => c.id !== parked.id));
  }, []);

  const deleteParkedCart = useCallback((id: string) => {
    setParkedCarts((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  /** Active cart total at Execute Payment — not a live recalc while modal is open. */
  const currentDueAmount = chargeSnapshot?.amount ?? total;
  const currentItemCount = chargeSnapshot?.itemCount ?? itemCount;

  return {
    cart,
    setCart,
    parkedCarts,
    parkCart,
    resumeCart,
    deleteParkedCart,
    clearCart,
    subtotal,
    tax,
    total,
    itemCount,
    isTerminalOpen,
    chargeSnapshot,
    currentDueAmount,
    currentItemCount,
    triggerCharge,
    closeTerminal,
  };
}
