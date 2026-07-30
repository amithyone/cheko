import React, { useState, useRef, useEffect } from "react";
import {
  Barcode,
  PackageCheck,
  Layers,
  Scan,
  ScanLine,
} from "lucide-react";
import { Product, CategoryItem, TagItem } from "@/types";
import { useNotice } from "@/context/NoticeContext";
import { BarcodeRenderer } from "../components/BarcodeRenderer";

interface AddSkuModalProps {
  open: boolean;
  onClose: () => void;
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  currencySymbol: string;
  categories: CategoryItem[];
  tags: TagItem[];
}

export function AddSkuModal({
  open,
  onClose,
  products,
  setProducts,
  currencySymbol,
  categories,
  tags,
}: AddSkuModalProps) {
  const notice = useNotice();

  const [tempVariations, setTempVariations] = useState<
    { id: string; size: string; color: string; stock: number }[]
  >([]);
  const [varSize, setVarSize] = useState("");
  const [varColor, setVarColor] = useState("");
  const [varStock, setVarStock] = useState("10");

  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("120");
  const [newSegment, setNewSegment] = useState<
    "Footwear" | "Apparel" | "Accessories" | "Limited"
  >("Footwear");
  const [newStock, setNewStock] = useState("15");
  const [newColor, setNewColor] = useState("Gray/Black");
  const [newSize, setNewSize] = useState("10.0");
  const [newSku, setNewSku] = useState("");
  const [newCategory, setNewCategory] = useState(
    categories[0]?.name || "Performance"
  );
  const [newProductTags, setNewProductTags] = useState<string[]>([]);

  const [isAwaitingBarcodeScan, setIsAwaitingBarcodeScan] = useState(false);
  const [scanInputValue, setScanInputValue] = useState("");
  const barcodeScanInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setTempVariations([]);
    setNewCategory(categories[0]?.name || "Performance");
    setNewProductTags([]);
    setNewSku("");
    setScanInputValue("");
    setIsAwaitingBarcodeScan(false);
    setNewName("");
    setNewPrice("120");
    setNewStock("15");
    setVarSize("");
    setVarColor("");
    setVarStock("10");
  };

  useEffect(() => {
    if (open) {
      setNewCategory(categories[0]?.name || "Performance");
      setNewProductTags([]);
      setNewSku("");
      setScanInputValue("");
      setIsAwaitingBarcodeScan(false);
      setTempVariations([]);
    }
  }, [open, categories]);

  useEffect(() => {
    if (isAwaitingBarcodeScan && open) {
      const t = setTimeout(() => barcodeScanInputRef.current?.focus(), 80);
      return () => clearTimeout(t);
    }
  }, [isAwaitingBarcodeScan, open]);

  const normalizeScannedBarcode = (raw: string): string => {
    const clean = raw.trim().replace(/\s/g, "");
    if (!clean) return "";
    if (clean.startsWith("#")) return clean;
    if (/^\d{8,14}$/.test(clean)) return `#BAR-${clean}`;
    if (clean.startsWith("REF-") || clean.startsWith("SNK-")) return `#${clean}`;
    return `#REF-${clean.toUpperCase().replace(/[^A-Z0-9-]/g, "")}`;
  };

  const applyScannedBarcodeToSku = (raw: string) => {
    const code = normalizeScannedBarcode(raw);
    if (!code) {
      notice.showWarning("No barcode read. Scan again or type a code.", "Scan empty");
      return false;
    }
    if (products.some((p) => p.sku.toLowerCase() === code.toLowerCase())) {
      notice.showError(
        `"${code}" is already registered on another item.`,
        "Duplicate barcode"
      );
      return false;
    }
    setNewSku(code);
    setScanInputValue("");
    setIsAwaitingBarcodeScan(false);
    notice.showSuccess(`Scanned code linked: ${code}`, "Barcode registered");
    return true;
  };

  const handleBarcodeScanSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    applyScannedBarcodeToSku(scanInputValue);
  };

  const simulateBarcodeRegistration = () => {
    const mockEan = `${Math.floor(1000000000000 + Math.random() * 8999999999999)}`;
    applyScannedBarcodeToSku(mockEan);
  };

  const toggleNewProductTag = (tagName: string) => {
    setNewProductTags((prev) =>
      prev.includes(tagName) ? prev.filter((t) => t !== tagName) : [...prev, tagName]
    );
  };

  const handleAddTempVariation = () => {
    if (!varSize && !varColor) {
      notice.showWarning("Specify at least a size or color tag.", "Variation required");
      return;
    }
    const stockVal = parseInt(varStock) || 0;
    const newVar = {
      id: `v-${Date.now()}-${Math.floor(Math.random() * 900)}`,
      size: varSize || "Universal",
      color: varColor || "Standard",
      stock: stockVal,
    };
    setTempVariations((prev) => [...prev, newVar]);
    setVarSize("");
    setVarColor("");
    setVarStock("10");
  };

  const handleRemoveTempVariation = (id: string) => {
    setTempVariations((prev) => prev.filter((v) => v.id !== id));
  };

  const handleAddSku = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;

    const finalSku = newSku.trim()
      ? newSku.trim().startsWith("#")
        ? newSku.trim()
        : `#REF-${newSku.trim().toUpperCase()}`
      : `#REF-${Math.floor(Math.random() * 90000) + 10000}`;

    const isDuplicate = products.some((p) => p.sku === finalSku);
    if (isDuplicate) {
      notice.showError(
        `SKU "${finalSku}" is already assigned to another catalog entry.`,
        "Duplicate SKU"
      );
      return;
    }

    const baseStockVal = parseInt(newStock) || 12;

    const finalVariations =
      tempVariations.length > 0
        ? tempVariations
        : [
            {
              id: `v-1-${Date.now()}`,
              size: newSize,
              color: newColor,
              stock: baseStockVal,
            },
          ];

    const totalStock = finalVariations.reduce((acc, v) => acc + v.stock, 0);

    const newProductItem: Product = {
      sku: finalSku,
      name: newName,
      category: newCategory || (categories[0]?.name ?? "General"),
      tags: newProductTags.length > 0 ? [...newProductTags] : undefined,
      price: parseFloat(newPrice) || 99,
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAH1LdwjAY2JIUtqWwI14RNtXmJa6EoIdMQS4DDjrIPyCEvWvIzP7TLao3f-UtjAEQETsN8pT9ZUWnom8nfUvVH8eEIVqBCTjxwQVLMUGF0AjWc7IeQL7pS4JmxWsQIy-0HhVfkqKsAqd-8nRFtrBX3BwLTSuLLRo6gKy6OAnKAKVIig4fCti0bDVw8P83VpI4aYetE1J8i61t1bZfpbBnBAxGqzXMrhWxvyyCudoKGhtDk_a-Y-UxASUeewfYLJ6eEErY-ZUgOKLQ",
      size: newSize,
      color: newColor,
      stock: totalStock,
      stockIntegrity: totalStock <= 10 ? "Critical" : "Optimal",
      segment: newSegment,
      variations: finalVariations,
    };

    setProducts((prev) => [newProductItem, ...prev]);
    resetForm();
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-full max-w-xl p-6 sm:p-8 shadow-2xl border border-slate-100 relative animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto no-scrollbar">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg"
        >
          <span className="text-base font-bold font-mono">✕</span>
        </button>

        <h3 className="font-display text-lg font-black text-slate-800 mb-2 flex items-center gap-2">
          <PackageCheck className="text-primary w-5 h-5 animate-pulse" />
          Register New SKU catalog & Variations
        </h3>
        <p className="text-xs text-slate-400 font-medium mb-6 leading-relaxed">
          Set product title, scan or enter a barcode to link to this SKU, then add
          variations below.
        </p>

        <form onSubmit={handleAddSku} className="space-y-5 text-xs font-semibold">
          <div>
            <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1.5">
              Product Name
            </label>
            <input
              type="text"
              value={newName}
              required
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. AeroSwift Max Trainer"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:ring-2 focus:ring-primary/10 focus:border-primary"
            />
          </div>

          <div className="p-4 bg-indigo-50/60 border border-indigo-100 rounded-2xl space-y-3">
            <div className="flex justify-between items-center border-b border-indigo-100/80 pb-2">
              <h4 className="text-[10px] font-bold text-indigo-800 uppercase tracking-widest flex items-center gap-1.5">
                <ScanLine className="w-4 h-4 text-indigo-500" />
                Register scanned barcode
              </h4>
              {newSku ? (
                <span className="text-[9px] font-extrabold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full uppercase">
                  Code linked
                </span>
              ) : (
                <span className="text-[9px] font-extrabold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full uppercase">
                  Awaiting scan
                </span>
              )}
            </div>

            <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
              Click <strong>Listen for scan</strong>, then scan with your USB or
              Bluetooth scanner (or type the code and press Enter).
            </p>

            {isAwaitingBarcodeScan && (
              <div className="flex items-center gap-2 px-3 py-2 bg-white border-2 border-indigo-400 rounded-xl">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-600" />
                </span>
                <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wide">
                  Scanner active — scan now
                </span>
              </div>
            )}

            <div className="flex gap-2">
              <div className="relative flex-1">
                <Scan className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  ref={barcodeScanInputRef}
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  value={scanInputValue}
                  onChange={(e) => setScanInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      e.stopPropagation();
                      handleBarcodeScanSubmit();
                    }
                  }}
                  placeholder="Scan barcode or type EAN / SKU…"
                  className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400"
                />
              </div>
              <button
                type="button"
                onClick={() => handleBarcodeScanSubmit()}
                className="px-3 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl text-[10px] uppercase cursor-pointer shrink-0"
              >
                Link
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsAwaitingBarcodeScan(true);
                  setScanInputValue("");
                }}
                className={`flex-1 min-w-[120px] py-2 rounded-xl text-[10px] font-extrabold uppercase flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                  isAwaitingBarcodeScan
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-white border-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                }`}
              >
                <Scan className="w-3.5 h-3.5" />
                {isAwaitingBarcodeScan ? "Listening…" : "Listen for scan"}
              </button>
              <button
                type="button"
                onClick={simulateBarcodeRegistration}
                className="px-3 py-2 bg-white border border-slate-200 hover:border-indigo-300 text-slate-600 hover:text-indigo-700 rounded-xl text-[10px] font-bold cursor-pointer"
              >
                Simulate scan
              </button>
              {newSku && (
                <button
                  type="button"
                  onClick={() => {
                    setNewSku("");
                    setScanInputValue("");
                    notice.showInfo("Barcode cleared. Scan or enter a new code.");
                  }}
                  className="px-3 py-2 text-rose-600 hover:bg-rose-50 border border-rose-100 rounded-xl text-[10px] font-bold cursor-pointer"
                >
                  Clear code
                </button>
              )}
            </div>

            {newSku && (
              <div className="flex items-center gap-4 p-3 bg-white border border-indigo-100 rounded-xl">
                <BarcodeRenderer value={newSku} />
                <div className="min-w-0 flex-1">
                  <p className="text-[9px] font-bold text-slate-400 uppercase">
                    Registered scan code
                  </p>
                  <p className="font-mono font-black text-indigo-700 text-sm truncate">
                    {newSku}
                  </p>
                  <p className="text-[9px] text-slate-400 mt-0.5">
                    This code will be saved with the new catalog item.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1.5 flex justify-between items-center">
              <span>Barcode / SKU (manual override)</span>
              <span className="text-[9px] text-slate-400 font-medium font-sans lowercase">
                Leave blank to auto-generate
              </span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={newSku}
                onChange={(e) => setNewSku(e.target.value)}
                placeholder="e.g. 735005382012 or #BAR-735005382012"
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:ring-2 focus:ring-primary/10 focus:border-primary font-mono text-indigo-600 font-bold"
              />
              <div className="absolute left-3.5 top-3.5">
                <Barcode className="w-3.5 h-3.5 text-slate-450" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1.5">
                Pricing Unit ({currencySymbol})
              </label>
              <input
                type="number"
                value={newPrice}
                required
                onChange={(e) => setNewPrice(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:ring-2 focus:ring-primary/10 focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1.5">
                Category Segment
              </label>
              <select
                value={newSegment}
                onChange={(e) =>
                  setNewSegment(
                    e.target.value as
                      | "Footwear"
                      | "Apparel"
                      | "Accessories"
                      | "Limited"
                  )
                }
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none"
              >
                <option value="Footwear">Footwear</option>
                <option value="Apparel">Apparel</option>
                <option value="Limited">Limited</option>
                <option value="Accessories">Accessories</option>
              </select>
            </div>
          </div>

          {categories.length > 0 && (
            <div>
              <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1.5">
                Store Category
              </label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {tags.length > 0 && (
            <div>
              <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1.5">
                Product Tags
              </label>
              <div className="flex flex-wrap gap-2">
                {tags.map((t) => {
                  const active = newProductTags.includes(t.name);
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => toggleNewProductTag(t.name)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                        active
                          ? "text-white border-transparent"
                          : "bg-slate-50 border-slate-200 text-slate-600 hover:border-indigo-300"
                      }`}
                      style={active ? { backgroundColor: t.color } : undefined}
                    >
                      {t.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3.5">
            <div className="flex justify-between items-center border-b border-slate-200/60 pb-2">
              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-500" />
                Product Sizing & Color Variations
              </h4>
              <span className="text-[9px] font-extrabold bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full uppercase">
                {tempVariations.length} custom variants
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 items-end">
              <div>
                <label className="block text-[9px] font-bold text-slate-450 uppercase mb-1.5 font-sans">
                  Size Tag
                </label>
                <input
                  type="text"
                  placeholder="e.g. 10.5, Medium"
                  value={varSize}
                  onChange={(e) => setVarSize(e.target.value)}
                  className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-lg text-[11px]"
                />
              </div>
              <div>
                <label className="block text-[9px] font-bold text-slate-450 uppercase mb-1.5 font-sans">
                  Color Tag
                </label>
                <input
                  type="text"
                  placeholder="e.g. Matte Crimson"
                  value={varColor}
                  onChange={(e) => setVarColor(e.target.value)}
                  className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-lg text-[11px]"
                />
              </div>
              <div className="flex gap-1.5">
                <div className="flex-1">
                  <label className="block text-[9px] font-bold text-slate-450 uppercase mb-1.5 font-sans">
                    Stock
                  </label>
                  <input
                    type="number"
                    placeholder="10"
                    value={varStock}
                    onChange={(e) => setVarStock(e.target.value)}
                    className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-lg text-[11px]"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddTempVariation}
                  className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg cursor-pointer shrink-0"
                >
                  + Add
                </button>
              </div>
            </div>

            {tempVariations.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1 border-t border-slate-200/40">
                {tempVariations.map((v) => (
                  <span
                    key={v.id}
                    className="px-2.5 py-1 bg-white border border-slate-210 rounded-lg text-[10px] font-bold flex gap-1.5 items-center hover:border-rose-300"
                  >
                    <span>
                      Sz: {v.size} | {v.color} ({v.stock} units)
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTempVariation(v.id)}
                      className="text-stone-400 hover:text-rose-600 text-[10px] font-bold"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1.5">
                Universal Display Size (Fallback)
              </label>
              <input
                type="text"
                value={newSize}
                onChange={(e) => setNewSize(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1.5">
                Universal Color (Fallback)
              </label>
              <input
                type="text"
                value={newColor}
                onChange={(e) => setNewColor(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full h-11 bg-indigo-650 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold tracking-wider active:scale-95 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <PackageCheck className="w-4 h-4" /> Save Item to Store Catalog
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
