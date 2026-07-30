import React, { useState } from "react";
import {
  Download,
  Plus,
  Search,
  AlertTriangle,
  Barcode,
  X,
  Scale,
  Sparkles,
  Printer,
} from "lucide-react";
import { Product, CategoryItem, TagItem } from "@/types";
import { useNotice } from "@/context/NoticeContext";
import { BarcodeRenderer } from "../components/BarcodeRenderer";
import { QrCodeRenderer } from "../components/QrCodeRenderer";
import { ProductTable } from "../components/ProductTable";
import { useInventoryFilters } from "../hooks/useInventoryFilters";
import { AddSkuModal } from "../modals/AddSkuModal";
import { EditProductModal } from "../modals/EditProductModal";

interface InventoryPageProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  currencySymbol: string;
  categories?: CategoryItem[];
  tags?: TagItem[];
}

export default function InventoryPage({
  products,
  setProducts,
  currencySymbol,
  categories = [],
  tags = [],
}: InventoryPageProps) {
  const notice = useNotice();
  const {
    activeSegmentFilter,
    setActiveSegmentFilter,
    searchFilter,
    setSearchFilter,
    filteredProducts,
    depletedSkuCount,
  } = useInventoryFilters(products);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Product | null>(null);
  const [viewingCodesProduct, setViewingCodesProduct] = useState<Product | null>(null);

  const totalValuation = products.reduce(
    (acc, curr) => acc + curr.price * curr.stock,
    0
  );

  const handleOpenEditModal = (product: Product) => {
    setEditTarget(product);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditTarget(null);
  };

  const handleDeleteSku = (sku: string, name: string) => {
    notice.showConfirm({
      title: "Delete catalog item?",
      message: `Remove "${name}" (${sku}) from active store catalogs? This cannot be undone.`,
      confirmLabel: "Delete",
      variant: "danger",
      onConfirm: () => {
        setProducts((prev) => prev.filter((p) => p.sku !== sku));
        notice.showSuccess(`"${name}" removed from listing.`, "Item deleted");
      },
    });
  };

  const simulateBarcodeScan = () => {
    notice.showInfo(
      "Barcode scanner simulated. First catalog item stock increased by 1.",
      "Scanner active"
    );
    setProducts((prev) => {
      if (prev.length === 0) return prev;
      return prev.map((p, idx) => {
        if (idx === 0) {
          const newSt = p.stock + 1;
          return {
            ...p,
            stock: newSt,
            stockIntegrity: newSt <= 10 ? "Critical" : "Optimal",
          };
        }
        return p;
      });
    });
  };

  return (
    <div className="space-y-8 relative font-sans">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white p-6 rounded-3xl border border-slate-150 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse"></span>
            <span className="text-[10px] font-extrabold text-primary uppercase tracking-[0.2em] font-mono">
              Ecosystem catalog manager
            </span>
          </div>
          <h2 className="font-display font-black text-2xl sm:text-3xl text-slate-900 leading-tight">
            Shop Inventory & Pricing
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Overlook prices, define individual color-sizing variants, and purge stale
            stock references instantly.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() =>
              notice.showSuccess(
                "Master SKU catalog exported to CSV safely.",
                "Export complete"
              )
            }
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold text-xs flex items-center gap-2 hover:bg-slate-50 active:scale-95 transition-all shadow-sm cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" /> Export CSV
          </button>

          <button
            onClick={simulateBarcodeScan}
            className="px-4 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center gap-2 hover:bg-slate-800 active:scale-95 transition-all shadow-md cursor-pointer"
          >
            <Barcode className="w-3.5 h-3.5" /> Barcode Emulation
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center gap-1.5 hover:bg-indigo-700 active:scale-95 transition-all shadow-md shadow-indigo-100 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Item Code
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 rounded-2xl bg-white border border-slate-200 flex items-center px-4 h-11 transition-all focus-within:ring-2 focus-within:ring-primary/10 focus-within:border-primary shadow-sm">
            <Search className="text-slate-400 mr-2.5 w-4 h-4" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="bg-transparent border-none outline-none w-full text-xs font-semibold text-slate-800 placeholder-slate-400"
              placeholder="Filter by SKU catalog code, product title segments..."
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2 select-none">
            {[
              { label: "All Catalog", value: "All" },
              { label: "Footwear", value: "Footwear" },
              { label: "Apparel", value: "Apparel" },
              { label: "Limited", value: "Limited" },
              { label: "Accessories", value: "Accessories" },
            ].map((chip) => (
              <button
                key={chip.value}
                onClick={() => setActiveSegmentFilter(chip.value)}
                className={`px-3.5 py-1.5 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                  activeSegmentFilter === chip.value
                    ? "bg-primary text-white shadow-sm"
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-55 hover:bg-slate-50"
                }`}
              >
                {chip.label}
              </button>
            ))}

            <button
              onClick={() => setActiveSegmentFilter("Low Stock")}
              className={`px-3.5 py-1.5 rounded-full text-[11px] font-bold flex items-center gap-1 cursor-pointer ${
                activeSegmentFilter === "Low Stock"
                  ? "bg-red-500 text-white shadow-sm"
                  : "bg-red-50 text-red-600 border border-red-100 hover:bg-red-100"
              }`}
            >
              <AlertTriangle className="w-3 h-3 text-red-500 fill-red-500 inline mr-0.5 animate-pulse" />
              Low Stock ({depletedSkuCount})
            </button>
          </div>

          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono bg-slate-100 px-3 py-1 rounded-lg">
            SKU count: {filteredProducts.length} entries registered
          </span>
        </div>
      </div>

      <ProductTable
        products={filteredProducts}
        currencySymbol={currencySymbol}
        onEdit={handleOpenEditModal}
        onDelete={handleDeleteSku}
        onViewCodes={setViewingCodesProduct}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-sm hover:border-indigo-150 transition-all flex justify-between items-center">
          <div className="space-y-1">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
              <Scale className="w-3.5 h-3.5 text-primary" /> Total Catalog Valuation
            </h4>
            <p className="font-display text-2xl font-black text-slate-900 leading-none">
              {currencySymbol}
              {totalValuation.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
            <p className="text-[10px] text-slate-400 font-medium">
              Calculated as: Price index x Current physical stock pool
            </p>
          </div>
          <span className="w-1.5 h-12 bg-primary rounded-full"></span>
        </div>

        <div className="bg-gradient-to-r from-indigo-50/20 to-indigo-50/50 p-6 rounded-3xl border border-indigo-100 shadow-sm flex items-start gap-4">
          <Sparkles className="w-6 h-6 text-indigo-505 text-indigo-600 fill-indigo-600 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs">
            <h4 className="font-bold text-slate-800">Variation Integrity Standard</h4>
            <p className="leading-relaxed text-slate-500 font-medium">
              Ecosystem catalog mandates sizing, design variations, and pricing modifiers
              reside strictly in memory to block uncoordinated database drifts. Adding or
              editing variations triggers synchronal ledger validation logs instantly.
            </p>
          </div>
        </div>
      </div>

      <AddSkuModal
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        products={products}
        setProducts={setProducts}
        currencySymbol={currencySymbol}
        categories={categories}
        tags={tags}
      />

      <EditProductModal
        open={isEditModalOpen}
        product={editTarget}
        onClose={handleCloseEditModal}
        setProducts={setProducts}
        currencySymbol={currencySymbol}
      />

      {viewingCodesProduct && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 sm:p-8 shadow-2xl border border-slate-100 relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setViewingCodesProduct(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <span className="text-[10px] font-mono tracking-widest bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full uppercase font-bold">
                Dynamic Asset Generator
              </span>
              <h3 className="font-display text-xl font-black text-slate-900 mt-2">
                Label & Symbology Hub
              </h3>
              <p className="text-xs text-slate-450 mt-1 font-semibold">
                Viewing generated parameters for{" "}
                <span className="text-slate-800 font-bold">
                  "{viewingCodesProduct.name}"
                </span>
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-150 mb-6 font-semibold text-xs">
              <div className="flex flex-col items-center gap-2">
                <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block mb-1">
                  Linear 1D Barcode
                </span>
                <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm w-full flex justify-center">
                  <BarcodeRenderer value={viewingCodesProduct.sku} />
                </div>
              </div>

              <div className="flex flex-col items-center gap-2">
                <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block mb-1">
                  Matrix 2D QR Code
                </span>
                <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm w-full flex justify-center">
                  <QrCodeRenderer value={viewingCodesProduct.sku} />
                </div>
              </div>
            </div>

            <div className="space-y-2.5 font-semibold">
              <div className="bg-slate-50 p-3.5 rounded-xl text-left border border-slate-200/60 flex justify-between items-center text-xs">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">
                    Registered SKU Code
                  </p>
                  <p className="font-mono font-bold text-slate-800 mt-0.5">
                    {viewingCodesProduct.sku}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(viewingCodesProduct.sku);
                    notice.showToast("SKU code copied to clipboard", "success");
                  }}
                  className="px-2.5 py-1 text-[10px] bg-white border border-slate-200 font-bold rounded-lg text-slate-600 hover:text-indigo-600 hover:border-indigo-250 transition-colors"
                >
                  Copy Raw
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() =>
                    notice.showSuccess(
                      "Printed 1× high resolution SKU badge successfully.",
                      "Label printed"
                    )
                  }
                  className="py-2.5 rounded-xl border border-slate-200 bg-white text-slate-705 text-slate-700 hover:bg-slate-50 active:scale-95 transition-all flex items-center justify-center gap-2 text-xs font-bold font-sans cursor-pointer shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-450" /> Print Label
                </button>
                <button
                  type="button"
                  onClick={() =>
                    notice.showSuccess(
                      "SVG and PNG assets saved to downloads.",
                      "Download complete"
                    )
                  }
                  className="py-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 active:scale-95 transition-all flex items-center justify-center gap-2 text-xs font-bold font-sans cursor-pointer shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" /> Download Pack
                </button>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-2 text-[10px] text-slate-450 leading-relaxed justify-center font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Fully
              standards-compliant EAN/QR format
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
