import { CartItem } from "@/types";

const TAX_RATE = 0.085;

export function useCheckoutTotals(cart: CartItem[]) {
  const subtotal = cart.reduce(
    (acc, curr) => acc + curr.product.price * curr.quantity,
    0
  );
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;

  return {
    subtotal,
    tax,
    total,
    taxRate: TAX_RATE,
  };
}
