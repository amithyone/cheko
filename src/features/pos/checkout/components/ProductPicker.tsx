import React, { useState } from "react";
import { Trash2, HelpCircle, Search, Scan, MessageSquare, Store } from "lucide-react";
import { Product, BusinessType } from "@/types";
import {
  BUSINESS_TYPE_OPTIONS,
  getCategoriesForBusinessType,
  getSearchPlaceholder,
} from "@/shared/utils/business-types";
import { ServiceQuickActions } from "./ServiceQuickActions";
import { HotelManagementPanel } from "@/features/hotel/components/HotelManagementPanel";
import { FlightBookingPanel } from "@/features/flights/components/FlightBookingPanel";
import type { HotelManagement } from "@/hooks/useHotelManagement";
import type { FlightBookingManagement } from "@/hooks/useFlightBooking";

interface ProductPickerProps {
  products: Product[];
  businessType: BusinessType;
  onBusinessTypeChange: (type: BusinessType) => void;
  currencySymbol: string;
  onAddToCart: (product: Product) => void;
  onSendChatMessage: (text: string) => void;
  onToggleChat: () => void;
  chatMessageCount: number;
  onScanningChange?: (scanning: boolean) => void;
  cartItemCount?: number;
  cartTotal?: number;
  onFolioPosted?: () => void;
  hotel: HotelManagement;
  flightBooking: FlightBookingManagement;
}

export function ProductPicker({
  products,
  businessType,
  onBusinessTypeChange,
  currencySymbol,
  onAddToCart,
  onSendChatMessage,
  onToggleChat,
  chatMessageCount,
  onScanningChange,
  cartItemCount = 0,
  cartTotal = 0,
  onFolioPosted,
  hotel,
  flightBooking,
}: ProductPickerProps) {
  const [activeTab, setActiveTab] = useState<string>("All");
  const [catalogSearch, setCatalogSearch] = useState<string>("");
  const [isScanning, setIsScanning] = useState<boolean>(false);

  const handleBusinessChange = (type: BusinessType) => {
    onBusinessTypeChange(type);
    setActiveTab("All");
    setCatalogSearch("");
  };

  const domainTabs = getCategoriesForBusinessType(businessType);

  let filteredProducts = products.filter((p) => {
    if (activeTab === "All") return true;
    return p.category.toLowerCase() === activeTab.toLowerCase();
  });

  if (catalogSearch.trim() !== "") {
    const searchLow = catalogSearch.toLowerCase();
    filteredProducts = filteredProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(searchLow) ||
        p.sku.toLowerCase().includes(searchLow) ||
        p.category.toLowerCase().includes(searchLow)
    );
  }

  const triggerBarcodeScanSimulate = () => {
    if (products.length === 0) return;
    setIsScanning(true);
    onScanningChange?.(true);

    const randomProduct = products[Math.floor(Math.random() * products.length)];

    setTimeout(() => {
      onAddToCart(randomProduct);
      setIsScanning(false);
      onScanningChange?.(false);
      onSendChatMessage(
        `System Intercom: Simulating scanner reading SKU ${randomProduct.sku}. Added ${randomProduct.name} to active cart.`
      );
    }, 900);
  };

  return (
    <section className="flex-1 overflow-y-auto p-8 flex flex-col justify-between">
      <div className="space-y-6">

        <div className="flex flex-col gap-4 bg-white p-4 rounded-2xl border border-slate-200">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Terminal Register</p>
            <h3 className="font-display font-bold text-base text-slate-800 flex items-center gap-2">
              <Store className="w-4 h-4 text-primary" />
              Category & Industry Target
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 bg-slate-100 p-1.5 rounded-xl">
            {BUSINESS_TYPE_OPTIONS.map((opt) => (
              <button
                key={opt.type}
                type="button"
                onClick={() => handleBusinessChange(opt.type)}
                className={`px-3 py-2.5 rounded-lg font-bold text-xs tracking-wide transition-all cursor-pointer text-center ${
                  businessType === opt.type
                    ? "bg-white text-primary shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {businessType === "Services" && <ServiceQuickActions />}

        {businessType === "Hotels" && (
          <HotelManagementPanel
            hotel={hotel}
            currencySymbol={currencySymbol}
            cartItemCount={cartItemCount}
            cartTotal={cartTotal}
            onFolioPosted={onFolioPosted}
          />
        )}

        {businessType === "Flights" && (
          <FlightBookingPanel
            flights={flightBooking}
            currencySymbol={currencySymbol}
            onAddToCart={onAddToCart}
          />
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 rounded-xl bg-white border border-slate-200 flex items-center px-4 h-12 transition-all focus-within:ring-2 focus-within:ring-primary/10 focus-within:border-primary shadow-sm">
            <Search className="text-slate-400 mr-2.5 w-4 h-4" />
            <input
              type="text"
              value={catalogSearch}
              onChange={(e) => setCatalogSearch(e.target.value)}
              className="bg-transparent border-none outline-none w-full text-xs text-slate-800 placeholder-slate-400 font-medium"
              placeholder={getSearchPlaceholder(businessType)}
            />
            {catalogSearch && (
              <button
                type="button"
                onClick={() => setCatalogSearch("")}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={triggerBarcodeScanSimulate}
            disabled={isScanning}
            className={`px-5 h-12 rounded-xl font-bold text-xs tracking-wider flex items-center justify-center gap-2.5 shadow-sm transition-all border cursor-pointer ${
              isScanning
                ? "bg-emerald-50 text-emerald-600 border-emerald-200 animate-pulse"
                : "bg-white border-slate-200 hover:bg-slate-50 text-slate-700"
            }`}
          >
            <Scan className={`w-4 h-4 text-emerald-500 ${isScanning ? "animate-spin" : ""}`} />
            {isScanning ? "BEAM SCANNING..." : "SCAN BARCODE"}
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {domainTabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-full font-bold text-xs tracking-wide transition-all cursor-pointer ${
                activeTab === tab
                  ? "bg-primary text-white shadow-md active:scale-95 duration-100"
                  : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredProducts.map((product) => (
            <div
              key={product.sku}
              onClick={() => onAddToCart(product)}
              className="group cursor-pointer bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg border border-slate-150 transition-all hover:-translate-y-1"
            >
              <div className="aspect-[4/3] bg-slate-50 relative overflow-hidden">
                <img
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  src={product.image}
                  alt={product.name}
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md text-slate-800 px-3 py-1 rounded-full font-display text-xs font-bold shadow-sm">
                  {currencySymbol}{product.price.toFixed(2)}
                </div>
              </div>

              <div className="p-4">
                <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[9px] font-bold uppercase tracking-wider">
                  {product.category}
                </span>
                <h3 className="font-display font-semibold text-sm text-slate-800 leading-tight group-hover:text-primary transition-colors mt-2 mb-1">
                  {product.name}
                </h3>
                <div className="flex justify-between items-center text-xs text-slate-400 font-medium">
                  <span>{product.size}</span>
                  <span className={`font-bold ${product.stock <= 10 ? "text-red-500" : "text-emerald-600"}`}>
                    {product.stock} left
                  </span>
                </div>
              </div>
            </div>
          ))}
          {filteredProducts.length === 0 && (
            <div className="col-span-full py-16 text-center text-slate-400 bg-white border border-slate-200 rounded-3xl">
              <p className="font-semibold text-sm">No inventory items match search parameters.</p>
              <p className="text-xs text-slate-400 mt-1">Try changing category or typing another keyword.</p>
            </div>
          )}
        </div>
      </div>

      {isScanning && (
        <div className="absolute inset-x-0 h-1 bg-red-500 top-1/2 left-0 shadow-[0_0_12px_4px_rgba(239,68,68,0.7)] z-30 pointer-events-none animate-bounce" />
      )}

      <div className="mt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-150/40 rounded-xl text-xs text-slate-500 font-medium">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-slate-400" />
          <span>Select/Click an option to add to cart or click &apos;SCAN BARCODE&apos; to append random item.</span>
        </div>
        <button
          type="button"
          onClick={onToggleChat}
          className="flex items-center gap-2 text-primary font-bold hover:underline cursor-pointer"
        >
          <MessageSquare className="w-4 h-4" /> Toggle Intercom Chat ({chatMessageCount})
        </button>
      </div>
    </section>
  );
}
