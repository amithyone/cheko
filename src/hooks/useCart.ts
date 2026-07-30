import { useState, useCallback } from "react";
import type { CartItem, ParkedCart } from "@/types";

const TAX_RATE = 0.085;

export function useCart() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [parkedCarts, setParkedCarts] = useState<ParkedCart[]>([]);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [customChargeAmount, setCustomChargeAmount] = useState<number | null>(null);

  const subtotal = cart.reduce((acc, curr) => acc + curr.product.price * curr.quantity, 0);
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;

  const triggerCharge = useCallback((tenderedAmt?: number) => {
    setCustomChargeAmount(tenderedAmt !== undefined ? tenderedAmt : null);
    setIsTerminalOpen(true);
  }, []);

  const closeTerminal = useCallback(() => {
    setIsTerminalOpen(false);
    setCustomChargeAmount(null);
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

  const currentDueAmount = customChargeAmount !== null ? customChargeAmount : total;

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
    isTerminalOpen,
    customChargeAmount,
    currentDueAmount,
    triggerCharge,
    closeTerminal,
  };
}
