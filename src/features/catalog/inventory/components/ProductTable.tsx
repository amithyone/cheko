import React from "react";
import { Barcode, Edit3, Trash2 } from "lucide-react";
import { Product } from "@/types";
import { StockBadge } from "./StockBadge";

interface ProductTableProps {
  products: Product[];
  currencySymbol: string;
  onEdit: (product: Product) => void;
  onDelete: (sku: string, name: string) => void;
  onViewCodes: (product: Product) => void;
}

export function ProductTable({
  products,
  currencySymbol,
  onEdit,
  onDelete,
  onViewCodes,
}: ProductTableProps) {
  return (
    <div className="bg-white rounded-3xl border border-slate-150 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                SKU Code
              </th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Product Reference
              </th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Pricing Structure
              </th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Combined Stock
              </th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Variations Profile
              </th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs font-semibold">
            {products.map((product) => (
              <tr
                key={product.sku}
                className="hover:bg-slate-50/40 transition-colors group"
              >
                <td className="px-6 py-5">
                  <div className="flex flex-col gap-1.5">
                    <span className="font-mono text-xs font-bold text-indigo-600 block">
                      {product.sku}
                    </span>
                    <button
                      type="button"
                      onClick={() => onViewCodes(product)}
                      className="px-2 py-1 max-w-[120px] bg-slate-50 border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-650 rounded text-[9px] font-mono text-slate-500 font-extrabold flex items-center gap-1.5 cursor-pointer transition-all"
                    >
                      <Barcode className="w-3.5 h-3.5 text-indigo-550" /> QR & Barcode
                    </button>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-50 overflow-hidden border border-slate-200 flex-shrink-0 flex items-center justify-center">
                      <img
                        alt={product.name}
                        className="w-full h-full object-cover"
                        src={product.image}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200";
                        }}
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-[13px]">{product.name}</p>
                      <p className="text-[10px] text-slate-400 font-medium">
                        Category: {product.category} ({product.segment})
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5 font-display text-slate-950 font-black text-sm">
                  {currencySymbol}
                  {product.price.toFixed(2)}
                </td>
                <td className="px-6 py-5">
                  <StockBadge stock={product.stock} />
                </td>
                <td className="px-6 py-5">
                  {product.variations && product.variations.length > 0 ? (
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                      {product.variations.map((v, idx) => (
                        <span
                          key={v.id || idx}
                          className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 rounded text-[9px] font-bold uppercase tracking-wider"
                          title={`Unit holds ${v.stock} in stock`}
                        >
                          {v.size !== "Universal" ? `Sz ${v.size}` : ""}{" "}
                          {v.color !== "Standard" ? v.color : "Universal"}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-slate-400 text-[10px] italic">
                      No active variations
                    </span>
                  )}
                </td>
                <td className="px-6 py-5 text-right space-x-1">
                  <button
                    onClick={() => onEdit(product)}
                    className="p-1 px-2.5 bg-slate-50 hover:bg-indigo-50 border border-slate-200 text-slate-600 hover:text-indigo-600 rounded-lg transition-colors inline-flex items-center gap-1 font-bold text-[10px] cursor-pointer"
                    title="Edit properties & Manage variations"
                  >
                    <Edit3 className="w-3 h-3" /> Edit / Variations
                  </button>

                  <button
                    onClick={() => onDelete(product.sku, product.name)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors inline-block cursor-pointer"
                    title="Delete product"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                  </button>
                </td>
              </tr>
            ))}

            {products.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-12 text-slate-400 font-bold">
                  No matching items in active catalog. Try adjusting filters or code
                  segments.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="p-4 bg-slate-50/50 border-t border-slate-100 text-xs text-slate-400 font-bold flex justify-between items-center select-none">
        <span>Displaying {products.length} entries of active warehouse logs</span>
        <span>Security Key Verified</span>
      </div>
    </div>
  );
}
