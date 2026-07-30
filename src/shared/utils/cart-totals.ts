import type { CartItem } from "@/types";
import { roundMoney } from "@/shared/utils/money";

export const CART_TAX_RATE = 0.085;

export function computeCartTotals(cart: CartItem[]) {
  const subtotal = roundMoney(
    cart.reduce((acc, curr) => acc + curr.product.price * curr.quantity, 0)
  );
  const tax = roundMoney(subtotal * CART_TAX_RATE);
  const total = roundMoney(subtotal + tax);
  const itemCount = cart.reduce((acc, curr) => acc + curr.quantity, 0);
  return { subtotal, tax, total, itemCount };
}
