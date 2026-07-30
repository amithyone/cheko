import React from "react";
import { Sparkles, Coins } from "lucide-react";
import { Product } from "@/types";
import { OrderBuilder, ModalCartItem } from "../components/OrderBuilder";

interface NewOrderModalProps {
  open: boolean;
  products: Product[];
  currencySymbol: string;
  banksList: string[];
  custName: string;
  onCustNameChange: (value: string) => void;
  custPhone: string;
  onCustPhoneChange: (value: string) => void;
  custAddress: string;
  onCustAddressChange: (value: string) => void;
  custInstructions: string;
  onCustInstructionsChange: (value: string) => void;
  selectedProductSku: string;
  onSelectedProductSkuChange: (sku: string) => void;
  itemQty: string;
  onItemQtyChange: (qty: string) => void;
  modalCart: ModalCartItem[];
  selectedBank: string;
  onSelectedBankChange: (bank: string) => void;
  computedModalCartTotal: number;
  onAddCartItem: () => void;
  onRemoveCartItem: (sku: string) => void;
  onOpenQuickSearch: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

export function NewOrderModal({
  open,
  products,
  currencySymbol,
  banksList,
  custName,
  onCustNameChange,
  custPhone,
  onCustPhoneChange,
  custAddress,
  onCustAddressChange,
  custInstructions,
  onCustInstructionsChange,
  selectedProductSku,
  onSelectedProductSkuChange,
  itemQty,
  onItemQtyChange,
  modalCart,
  selectedBank,
  onSelectedBankChange,
  computedModalCartTotal,
  onAddCartItem,
  onRemoveCartItem,
  onOpenQuickSearch,
  onSubmit,
  onClose,
}: NewOrderModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-full max-w-2xl p-6 sm:p-8 border border-slate-100 shadow-2xl relative animate-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto no-scrollbar">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-50 transition-colors"
        >
          <span className="text-lg font-bold font-mono">✕</span>
        </button>

        <h3 className="font-display font-black text-xl text-slate-800 mb-2 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-600 fill-indigo-600" /> Create Online Delivery Order
        </h3>
        <p className="text-xs text-slate-400 font-medium font-sans mb-6">
          As requested, you can add anything on the shop to build a custom online customer cart request below.
        </p>

        <form onSubmit={onSubmit} className="space-y-5 text-xs font-semibold">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1.5">Recipient Name</label>
              <input
                type="text"
                required
                placeholder="e.g. John Doe"
                value={custName}
                onChange={(e) => onCustNameChange(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:ring-2 focus:ring-primary/10 focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1.5">Contact Phone</label>
              <input
                type="text"
                required
                placeholder="e.g. +234 803 444 8899"
                value={custPhone}
                onChange={(e) => onCustPhoneChange(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:ring-2 focus:ring-primary/10 focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1.5">Shipping Destination address</label>
            <textarea
              required
              rows={2}
              placeholder="Street Name, Apt number, Area, City"
              value={custAddress}
              onChange={(e) => onCustAddressChange(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:ring-2 focus:ring-primary/10 focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1.5">Special logistics instructions</label>
            <input
              type="text"
              placeholder="e.g. Call when outside, fragile cargo packing"
              value={custInstructions}
              onChange={(e) => onCustInstructionsChange(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white"
            />
          </div>

          <OrderBuilder
            products={products}
            currencySymbol={currencySymbol}
            modalCart={modalCart}
            selectedProductSku={selectedProductSku}
            onSelectedProductSkuChange={onSelectedProductSkuChange}
            itemQty={itemQty}
            onItemQtyChange={onItemQtyChange}
            onAddCartItem={onAddCartItem}
            onRemoveCartItem={onRemoveCartItem}
            onOpenQuickSearch={onOpenQuickSearch}
            computedModalCartTotal={computedModalCartTotal}
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1.5 font-sans">
                Preferred Settlement Bank
              </label>
              <select
                value={selectedBank}
                onChange={(e) => onSelectedBankChange(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none"
              >
                {banksList.map((bank) => (
                  <option key={bank} value={bank}>{bank}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end text-[11px] text-slate-450 italic pb-2 font-medium">
              Generates dedicated Virtual Account codes instantly for instant API Webhook syncs.
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold tracking-wider active:scale-95 transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Coins className="w-4 h-4 text-emerald-400" /> Generate API Settlement Account & Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
