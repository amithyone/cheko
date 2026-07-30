import React from "react";
import {
  Trash2,
  Plus,
  Minus,
  FolderArchive,
  Scan,
} from "lucide-react";
import { Product, CartItem, ParkedCart } from "@/types";
import { CustomKeypad } from "./CustomKeypad";

interface CartPanelProps {
  cart: CartItem[];
  currencySymbol: string;
  isScanning: boolean;
  parkedCarts: ParkedCart[];
  subtotal: number;
  tax: number;
  total: number;
  isKeypadUnlocked: boolean;
  keypadInput: string;
  onShowParkModal: () => void;
  onResumeCart: (cart: ParkedCart) => void;
  onDeleteParkedCart: (id: string) => void;
  onAdjustQuantity: (sku: string, operation: "add" | "subtract") => void;
  onAddToCart: (product: Product) => void;
  onRemoveFromCart: (sku: string) => void;
  onKeypadPress: (val: string) => void;
  onKeypadBackspace: () => void;
  onRequestKeypadUnlock: () => void;
  onLockKeypad: () => void;
  onCharge: () => void;
}

export function CartPanel({
  cart,
  currencySymbol,
  isScanning,
  parkedCarts,
  subtotal,
  tax,
  total,
  isKeypadUnlocked,
  keypadInput,
  onShowParkModal,
  onResumeCart,
  onDeleteParkedCart,
  onAdjustQuantity,
  onAddToCart,
  onRemoveFromCart,
  onKeypadPress,
  onKeypadBackspace,
  onRequestKeypadUnlock,
  onLockKeypad,
  onCharge,
}: CartPanelProps) {
  return (
    <section className="w-full lg:w-[420px] bg-white border-l border-slate-200 flex flex-col shadow-xl z-20 relative">
      <div className="p-6 flex flex-col h-full justify-between">

        {/* Active Cart Title & Cart Minimization trigger */}
        <div className="border-b border-slate-100 pb-4 mb-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="font-display text-lg font-bold text-slate-800">Active Register</h2>
              <p className="text-xs text-slate-400 font-medium">Register Terminal #{isScanning ? "04-NFC" : "04"}</p>
            </div>

            {/* Park Active Cart minimize command (User Requirement) */}
            {cart.length > 0 && (
              <button
                onClick={onShowParkModal}
                className="px-3.5 py-1.5 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                title="Minimize / Park current checkout session"
              >
                <FolderArchive className="w-3.5 h-3.5" />
                Park Cart
              </button>
            )}
          </div>

          {/* List of Parked suspended carts (User Requirement) */}
          {parkedCarts.length > 0 && (
            <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-150">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                <FolderArchive className="w-3 h-3 text-amber-500" />
                Parked / Suspended Carts ({parkedCarts.length})
              </p>
              <div className="space-y-2 max-h-24 overflow-y-auto scrollbar">
                {parkedCarts.map((pc) => (
                  <div
                    key={pc.id}
                    className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs shadow-sm hover:border-primary/20 transition-all"
                  >
                    <div className="min-w-0 pr-2">
                      <p className="font-bold text-slate-700 truncate">{pc.customerName}</p>
                      <p className="text-[10px] text-slate-400">
                        {pc.items.reduce((s, i) => s + i.quantity, 0)} items ({currencySymbol}
                        {pc.total.toFixed(2)})
                      </p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => onResumeCart(pc)}
                        className="px-2 py-0.5 bg-primary text-white text-[10px] font-bold rounded hover:bg-primary-hover active:scale-95"
                      >
                        Resume
                      </button>
                      <button
                        onClick={() => onDeleteParkedCart(pc.id)}
                        className="p-1 text-slate-400 hover:text-red-500"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Cart item listing panel */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4 mb-4 scrollbar">
          {cart.map((item) => (
            <div
              key={item.product.sku}
              className="flex gap-4 p-3 bg-slate-50/65 rounded-xl border border-slate-100 items-center hover:bg-slate-50 transition-colors"
            >
              <div className="w-12 h-12 bg-white rounded-lg overflow-hidden border border-slate-150 flex-shrink-0">
                <img
                  className="w-full h-full object-cover"
                  src={item.product.image}
                  alt={item.product.name}
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start gap-1">
                  <p className="font-bold text-slate-800 text-xs truncate leading-snug">{item.product.name}</p>
                  <p className="font-display text-xs font-bold text-slate-900 flex-shrink-0">
                    {currencySymbol}{(item.product.price * item.quantity).toFixed(2)}
                  </p>
                </div>

                <div className="flex justify-between items-center mt-2">
                  <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                    Size: {item.selectedSize}
                  </p>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center bg-white border border-slate-250 rounded-lg overflow-hidden scale-90">
                      <button
                        onClick={() => onAdjustQuantity(item.product.sku, "subtract")}
                        className="p-1 hover:bg-slate-50 text-slate-500"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-1.5 text-xs font-bold text-slate-850">{item.quantity}</span>
                      <button
                        onClick={() => onAddToCart(item.product)}
                        className="p-1 hover:bg-slate-50 text-slate-500"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      onClick={() => onRemoveFromCart(item.product.sku)}
                      className="p-1 text-slate-400 hover:text-red-500 rounded-lg transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {cart.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 py-16 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-350 mb-3 border border-dashed border-slate-300">
                <Scan className="w-5 h-5" />
              </div>
              <p className="font-bold text-xs text-slate-500">Checkout cart is empty</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Add items from the catalog or simulation scanner</p>
            </div>
          )}
        </div>

        {/* Pricing & tactile controls pad */}
        <div className="border-t border-slate-100 pt-4 space-y-4">

          {/* Live Pricing Summary block */}
          <div className="space-y-2 text-xs select-none">
            <div className="flex justify-between text-slate-500">
              <span>Basket Subtotal</span>
              <span className="font-display font-semibold text-slate-700">{currencySymbol}{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-500 font-sans">
              <span>Tax Rate (8.5%)</span>
              <span className="font-display font-semibold text-slate-700">{currencySymbol}{tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between pt-1.5 border-t border-slate-150">
              <span className="font-display font-bold text-xs text-slate-800 uppercase tracking-wider">Total Due</span>
              <span className="font-display text-xl font-bold text-primary">
                {currencySymbol}{total.toFixed(2)}
              </span>
            </div>
            {isKeypadUnlocked && keypadInput && (
              <div className="flex justify-between items-center text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-100 font-sans">
                <span>Custom tender override:</span>
                <span className="font-display">{currencySymbol}{parseFloat(keypadInput).toFixed(2)}</span>
              </div>
            )}
          </div>

          <CustomKeypad
            isUnlocked={isKeypadUnlocked}
            onKeyPress={onKeypadPress}
            onBackspace={onKeypadBackspace}
            onRequestUnlock={onRequestKeypadUnlock}
            onLock={onLockKeypad}
          />

          {/* Charge uses cart total unless override unlocked */}
          <button
            onClick={onCharge}
            className="w-full h-16 bg-primary hover:bg-primary-hover text-white rounded-xl flex flex-col items-center justify-center shadow-lg active:scale-[0.98] transition-all group relative overflow-hidden cursor-pointer"
          >
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
            <span className="text-[9px] text-white/70 uppercase tracking-[0.2em] font-bold mb-0.5">
              EXECUTE PAYMENTS
            </span>
            <div className="flex items-center gap-1.5">
              <span className="font-display text-xl font-bold font-sans">CHARGE</span>
              <span className="font-display text-lg font-semibold opacity-90">
                {currencySymbol}
                {isKeypadUnlocked && keypadInput
                  ? parseFloat(keypadInput).toFixed(2)
                  : total.toFixed(2)}
              </span>
            </div>
          </button>
        </div>

      </div>
    </section>
  );
}
