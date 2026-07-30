import { CartItem } from "@/types";
import { computeCartTotals, CART_TAX_RATE } from "@/shared/utils/cart-totals";

export { CART_TAX_RATE };

export function useCheckoutTotals(cart: CartItem[]) {
  return computeCartTotals(cart);
}
