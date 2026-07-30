import React from "react";
import { Package, Search, Trash2 } from "lucide-react";
import { Product } from "@/types";

export type ModalCartItem = { product: Product; qty: number };

interface OrderBuilderProps {
  products: Product[];
  currencySymbol: string;
  modalCart: ModalCartItem[];
  selectedProductSku: string;
  onSelectedProductSkuChange: (sku: string) => void;
  itemQty: string;
  onItemQtyChange: (qty: string) => void;
  onAddCartItem: () => void;
  onRemoveCartItem: (sku: string) => void;
  onOpenQuickSearch: () => void;
  computedModalCartTotal: number;
}

export function OrderBuilder({
  products,
  currencySymbol,
  modalCart,
  selectedProductSku,
  onSelectedProductSkuChange,
  itemQty,
  onItemQtyChange,
  onAddCartItem,
  onRemoveCartItem,
  onOpenQuickSearch,
  computedModalCartTotal,
}: OrderBuilderProps) {
  return (
    <div className="p-4 bg-indigo-50/40 border border-indigo-100 rounded-2xl space-y-4">
      <div className="flex justify-between items-center border-b border-indigo-100 pb-2">
        <h4 className="text-[10px] font-bold text-indigo-700 uppercase tracking-widest flex items-center gap-1.5 font-mono">
          <Package className="w-4 h-4 text-indigo-500" />
          Multi-Item Order list builder
        </h4>
        <span className="text-[9px] font-extrabold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full uppercase">
          {modalCart.length} item segments selected
        </span>
      </div>

      <div className="space-y-2">
        <div className="grid grid-cols-5 gap-2 items-end">
          <div className="col-span-3">
            <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Pick anything from shop</label>
            <select
              value={selectedProductSku}
              onChange={(e) => onSelectedProductSkuChange(e.target.value)}
              className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-lg text-xs"
            >
              {products.map((p) => (
                <option key={p.sku} value={p.sku}>
                  {p.name} ({currencySymbol}{p.price.toFixed(0)}) — {p.stock} left
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Quantity</label>
            <input
              type="number"
              min="1"
              value={itemQty}
              onChange={(e) => onItemQtyChange(e.target.value)}
              className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-lg text-xs"
            />
          </div>
          <div>
            <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1 opacity-0">Add</label>
            <button
              type="button"
              onClick={onAddCartItem}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-lg text-xs uppercase cursor-pointer"
            >
              + Add
            </button>
          </div>
        </div>
        <button
          type="button"
          onClick={onOpenQuickSearch}
          className="w-full py-2.5 bg-white border-2 border-dashed border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50 text-indigo-700 font-extrabold rounded-xl text-[10px] uppercase flex items-center justify-center gap-2 cursor-pointer"
        >
          <Search className="w-4 h-4" />
          Quick search store to add items
        </button>
      </div>

      <div className="max-h-36 overflow-y-auto space-y-1 bg-white p-2 rounded-xl border border-indigo-100 font-mono text-[11px]">
        {modalCart.length > 0 ? (
          modalCart.map((it, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-2 bg-slate-50 border rounded-lg hover:border-slate-300"
            >
              <div className="flex flex-col">
                <span className="font-bold text-slate-800">{it.product.name}</span>
                <span className="text-[10px] text-slate-400">
                  {it.qty} unit{it.qty > 1 && "s"} x {currencySymbol}{it.product.price.toFixed(0)}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-bold text-slate-900">
                  {currencySymbol}{(it.product.price * it.qty).toLocaleString("en-US")}
                </span>
                <button
                  type="button"
                  onClick={() => onRemoveCartItem(it.product.sku)}
                  className="text-slate-400 hover:text-rose-600 text-[11px] font-bold p-1 cursor-pointer"
                  title="Remove item"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-6 text-slate-405 text-slate-400 font-sans italic selection:bg-transparent">
            No products added yet. Pick from dropdown above to add to the cargo payload!
          </div>
        )}
      </div>

      <div className="flex justify-between items-center text-xs font-bold pt-1 text-slate-700 border-t border-indigo-100/50">
        <span>Running Total Checkout Due:</span>
        <span className="text-base font-black text-indigo-750 font-display text-indigo-700">
          {currencySymbol}{computedModalCartTotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}
        </span>
      </div>
    </div>
  );
}
