import { useEffect, useRef } from "react";
import { hardwareBridge } from "@/shared/hardware/bridge";
import { parseWeightBarcode } from "@/shared/utils/barcode";
import type { Product } from "@/types";

interface UseBarcodeScannerOptions {
  enabled: boolean;
  products: Product[];
  onScanProduct: (product: Product, weightKg?: number) => void;
  onUnknownBarcode?: (barcode: string) => void;
}

export function useBarcodeScanner({
  enabled,
  products,
  onScanProduct,
  onUnknownBarcode,
}: UseBarcodeScannerOptions) {
  const productsRef = useRef(products);
  productsRef.current = products;

  useEffect(() => {
    if (!enabled) return;

    const handleScan = (barcode: string) => {
      const parsed = parseWeightBarcode(barcode);
      const list = productsRef.current;

      let product =
        list.find((p) => p.barcode === barcode) ??
        list.find((p) => p.sku === barcode) ??
        (parsed?.plu ? list.find((p) => p.plu === parsed.plu) : undefined);

      if (product) {
        onScanProduct(product, parsed?.weightKg);
        return;
      }
      onUnknownBarcode?.(barcode);
    };

    return hardwareBridge.onScan(handleScan);
  }, [enabled, onScanProduct, onUnknownBarcode]);
}
