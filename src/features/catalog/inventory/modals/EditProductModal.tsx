import React, { useState, useEffect } from "react";
import { Tag, Layers } from "lucide-react";
import { Product } from "@/types";
import { useNotice } from "@/context/NoticeContext";

interface EditProductModalProps {
  open: boolean;
  product: Product | null;
  onClose: () => void;
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  currencySymbol: string;
}

export function EditProductModal({
  open,
  product,
  onClose,
  setProducts,
  currencySymbol,
}: EditProductModalProps) {
  const notice = useNotice();
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showEditVarForm, setShowEditVarForm] = useState(false);
  const [editVarSize, setEditVarSize] = useState("");
  const [editVarColor, setEditVarColor] = useState("");
  const [editVarStock, setEditVarStock] = useState("10");

  useEffect(() => {
    if (open && product) {
      setEditingProduct({
        ...product,
        variations: product.variations || [
          {
            id: `v-edit-${Date.now()}`,
            size: product.size,
            color: product.color,
            stock: product.stock,
          },
        ],
      });
      setShowEditVarForm(false);
      setEditVarSize("");
      setEditVarColor("");
      setEditVarStock("10");
    } else if (!open) {
      setEditingProduct(null);
    }
  }, [open, product]);

  const handleClose = () => {
    setShowEditVarForm(false);
    onClose();
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    const calculatedStock =
      editingProduct.variations && editingProduct.variations.length > 0
        ? editingProduct.variations.reduce((acc, v) => acc + v.stock, 0)
        : editingProduct.stock;

    setProducts((prev) =>
      prev.map((p) =>
        p.sku === editingProduct.sku
          ? {
              ...editingProduct,
              stock: calculatedStock,
              stockIntegrity: calculatedStock <= 10 ? "Critical" : "Optimal",
            }
          : p
      )
    );
    handleClose();
    notice.showSuccess(`SKU ${editingProduct.sku} saved successfully.`, "Catalog updated");
  };

  const handleSubmitEditVariation = () => {
    if (!editingProduct) return;
    if (!editVarSize && !editVarColor) {
      notice.showWarning("Specify at least a size or color.", "Variation required");
      return;
    }
    const qty = parseInt(editVarStock) || 0;
    const newVar = {
      id: `v-edit-add-${Date.now()}`,
      size: editVarSize || "Universal",
      color: editVarColor || "Standard",
      stock: qty,
    };
    setEditingProduct((prev) =>
      prev ? { ...prev, variations: [...(prev.variations || []), newVar] } : null
    );
    setEditVarSize("");
    setEditVarColor("");
    setEditVarStock("10");
    setShowEditVarForm(false);
    notice.showToast("Variation added", "success");
  };

  const handleRemoveEditVariation = (vId: string) => {
    if (!editingProduct) return;
    const updated = (editingProduct.variations || []).filter((v) => v.id !== vId);
    setEditingProduct((prev) =>
      prev
        ? {
            ...prev,
            variations: updated,
          }
        : null
    );
  };

  if (!open || !editingProduct) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-full max-w-xl p-6 sm:p-8 shadow-2xl border border-slate-100 relative animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto no-scrollbar">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg"
        >
          <span className="text-base font-bold font-mono">✕</span>
        </button>

        <h3 className="font-display text-lg font-black text-slate-800 mb-1 flex items-center gap-2">
          <Tag className="text-indigo-600 w-5 h-5" /> Adjust Catalog & Variations
        </h3>
        <p className="text-xs text-slate-450 font-medium font-sans mb-5">
          Reference Code: {editingProduct.sku}
        </p>

        <form onSubmit={handleSaveEdit} className="space-y-5 text-xs font-semibold">
          <div>
            <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1.5">
              Product Name
            </label>
            <input
              type="text"
              value={editingProduct.name}
              required
              onChange={(e) =>
                setEditingProduct({ ...editingProduct, name: e.target.value })
              }
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1.5">
                Unit Price ({currencySymbol})
              </label>
              <input
                type="number"
                step="0.01"
                value={editingProduct.price}
                required
                onChange={(e) =>
                  setEditingProduct({
                    ...editingProduct,
                    price: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1.5">
                Category Segment Class
              </label>
              <span className="w-full px-3 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs block text-slate-500">
                {editingProduct.segment} ({editingProduct.category})
              </span>
            </div>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
            <div className="flex justify-between items-center border-b pb-2">
              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-505 text-indigo-600" />
                Interactive Variations List
              </h4>
              <button
                type="button"
                onClick={() => setShowEditVarForm((v) => !v)}
                className="px-2 py-1 bg-slate-900 border hover:bg-slate-800 text-white rounded text-[10px] font-black uppercase cursor-pointer"
              >
                {showEditVarForm ? "Cancel" : "+ Add Variation"}
              </button>
            </div>

            {showEditVarForm && (
              <div className="grid grid-cols-3 gap-2 items-end p-2 bg-white border border-slate-200 rounded-xl">
                <div>
                  <label className="block text-[9px] font-bold text-slate-450 uppercase mb-1">
                    Size
                  </label>
                  <input
                    type="text"
                    value={editVarSize}
                    onChange={(e) => setEditVarSize(e.target.value)}
                    placeholder="e.g. 10.5"
                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[11px]"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-450 uppercase mb-1">
                    Color
                  </label>
                  <input
                    type="text"
                    value={editVarColor}
                    onChange={(e) => setEditVarColor(e.target.value)}
                    placeholder="e.g. Crimson"
                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[11px]"
                  />
                </div>
                <div className="flex gap-1">
                  <div className="flex-1">
                    <label className="block text-[9px] font-bold text-slate-450 uppercase mb-1">
                      Stock
                    </label>
                    <input
                      type="number"
                      value={editVarStock}
                      onChange={(e) => setEditVarStock(e.target.value)}
                      className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[11px]"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleSubmitEditVariation}
                    className="self-end px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-[10px] cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>
            )}

            <div className="max-h-44 overflow-y-auto space-y-1.5 pr-1 font-mono text-[11px]">
              {editingProduct.variations && editingProduct.variations.length > 0 ? (
                editingProduct.variations.map((v, idx) => (
                  <div
                    key={v.id || idx}
                    className="flex items-center justify-between p-2 bg-white border rounded-xl hover:border-slate-350"
                  >
                    <div className="flex gap-4">
                      <span>
                        Size: <strong>{v.size}</strong>
                      </span>
                      <span>
                        Color: <strong>{v.color}</strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">
                        Stock:
                      </span>
                      <input
                        type="number"
                        value={v.stock}
                        onChange={(e) => {
                          const updatedVal = parseInt(e.target.value) || 0;
                          const updatedVars = (editingProduct.variations || []).map(
                            (val) =>
                              val.id === v.id ? { ...val, stock: updatedVal } : val
                          );
                          setEditingProduct({
                            ...editingProduct,
                            variations: updatedVars,
                          });
                        }}
                        className="w-14 px-1 py-0.5 border text-center rounded text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveEditVariation(v.id)}
                        className="text-slate-400 hover:text-rose-600 font-bold ml-1"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-slate-400 italic">
                  No variations linked. Click Add Variation above.
                </div>
              )}
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold tracking-wider active:scale-95 transition-all shadow-md cursor-pointer"
            >
              Adjust Integrity Logs & Variations
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
