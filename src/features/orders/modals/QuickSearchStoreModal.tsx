import React from "react";
import { Search } from "lucide-react";
import { Product } from "@/types";

interface QuickSearchStoreModalProps {
  open: boolean;
  products: Product[];
  quickSearchQuery: string;
  onQuickSearchQueryChange: (query: string) => void;
  itemQty: string;
  modalCartLength: number;
  onAddProduct: (product: Product) => void;
  onClose: () => void;
}

export function QuickSearchStoreModal({
  open,
  products,
  quickSearchQuery,
  onQuickSearchQueryChange,
  itemQty,
  modalCartLength,
  onAddProduct,
  onClose,
}: QuickSearchStoreModalProps) {
  if (!open) return null;

  const q = quickSearchQuery.trim().toLowerCase();
  const quickSearchResults = products.filter((p) => {
    if (!q) return true;
    return (
      p.name.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      (p.tags?.some((t) => t.toLowerCase().includes(q)) ?? false)
    );
  });

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-100 relative max-h-[85vh] flex flex-col">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer z-10"
        >
          <span className="text-base font-bold font-mono">✕</span>
        </button>

        <div className="p-6 pb-3 border-b border-slate-100">
          <h3 className="font-display text-lg font-black text-slate-800 flex items-center gap-2">
            <Search className="w-5 h-5 text-indigo-600" />
            Quick search store
          </h3>
          <p className="text-xs text-slate-400 font-medium mt-1">
            Find items by name, SKU, category, or tag. Tap to add with quantity {itemQty}.
          </p>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              autoFocus
              value={quickSearchQuery}
              onChange={(e) => onQuickSearchQueryChange(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-primary/10 focus:border-primary"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 pt-2 space-y-2 min-h-[200px] max-h-[50vh]">
          {quickSearchResults.length > 0 ? (
            quickSearchResults.map((p) => (
              <button
                key={p.sku}
                type="button"
                onClick={() => onAddProduct(p)}
                className="w-full flex items-center gap-3 p-3 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-xl text-left transition-all cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 overflow-hidden shrink-0">
                  <img
                    src={p.image}
                    alt=""
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=80";
                    }}
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-800 truncate">{p.name}</p>
                  <p className="text-[10px] text-slate-400 font-mono">
                    {p.sku} · {p.category} · {p.stock} in stock
                  </p>
                </div>
                <span className="text-xs font-black text-indigo-600 group-hover:text-indigo-700 shrink-0">
                  + Add
                </span>
              </button>
            ))
          ) : (
            <p className="text-center py-10 text-slate-400 text-xs font-medium italic">
              No products match &quot;{quickSearchQuery}&quot;
            </p>
          )}
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl cursor-pointer"
          >
            Done ({modalCartLength} in order list)
          </button>
        </div>
      </div>
    </div>
  );
}
