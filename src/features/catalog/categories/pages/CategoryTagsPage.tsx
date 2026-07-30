import React, { useState } from "react";
import {
  FolderTree,
  Tags,
  Plus,
  Edit3,
  Trash2,
  Search,
  ShieldCheck,
} from "lucide-react";
import { CategoryItem, TagItem } from "@/types";
import { useNotice } from "@/context/NoticeContext";

interface CategoryTagsViewProps {
  categories: CategoryItem[];
  setCategories: React.Dispatch<React.SetStateAction<CategoryItem[]>>;
  tags: TagItem[];
  setTags: React.Dispatch<React.SetStateAction<TagItem[]>>;
}

type EditKind = "category" | "tag";

const COLOR_PRESETS = [
  "#4f46e5", "#0ea5e9", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#f97316", "#14b8a6",
];

export default function CategoryTagsView({
  categories,
  setCategories,
  tags,
  setTags,
}: CategoryTagsViewProps) {
  const notice = useNotice();
  const [activeSection, setActiveSection] = useState<"categories" | "tags">("categories");
  const [searchFilter, setSearchFilter] = useState("");
  const [successToast, setSuccessToast] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editKind, setEditKind] = useState<EditKind>("category");
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formColor, setFormColor] = useState(COLOR_PRESETS[0]);

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(""), 4000);
  };

  const resetForm = () => {
    setFormName("");
    setFormDescription("");
    setFormColor(COLOR_PRESETS[0]);
    setEditingId(null);
  };

  const openCreate = (kind: EditKind) => {
    resetForm();
    setEditKind(kind);
    setIsModalOpen(true);
  };

  const openEditCategory = (cat: CategoryItem) => {
    setEditKind("category");
    setEditingId(cat.id);
    setFormName(cat.name);
    setFormDescription(cat.description);
    setFormColor(cat.color);
    setIsModalOpen(true);
  };

  const openEditTag = (tag: TagItem) => {
    setEditKind("tag");
    setEditingId(tag.id);
    setFormName(tag.name);
    setFormDescription("");
    setFormColor(tag.color);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = formName.trim();
    if (!trimmed) return;

    if (editKind === "category") {
      if (editingId) {
        setCategories((prev) =>
          prev.map((c) =>
            c.id === editingId
              ? { ...c, name: trimmed, description: formDescription.trim(), color: formColor }
              : c
          )
        );
        showToast(`Category "${trimmed}" updated.`);
      } else {
        const duplicate = categories.some(
          (c) => c.name.toLowerCase() === trimmed.toLowerCase()
        );
        if (duplicate) {
          notice.showError(`Category "${trimmed}" already exists.`, "Duplicate category");
          return;
        }
        setCategories((prev) => [
          ...prev,
          {
            id: `cat-${Date.now()}`,
            name: trimmed,
            description: formDescription.trim(),
            color: formColor,
          },
        ]);
        showToast(`Category "${trimmed}" created.`);
      }
    } else if (editingId) {
      setTags((prev) =>
        prev.map((t) =>
          t.id === editingId ? { ...t, name: trimmed, color: formColor } : t
        )
      );
      showToast(`Tag "${trimmed}" updated.`);
    } else {
      const duplicate = tags.some((t) => t.name.toLowerCase() === trimmed.toLowerCase());
      if (duplicate) {
        notice.showError(`Tag "${trimmed}" already exists.`, "Duplicate tag");
        return;
      }
      setTags((prev) => [
        ...prev,
        { id: `tag-${Date.now()}`, name: trimmed, color: formColor },
      ]);
      showToast(`Tag "${trimmed}" created.`);
    }

    closeModal();
  };

  const handleDeleteCategory = (id: string, name: string) => {
    notice.showConfirm({
      title: "Delete category?",
      message: `Remove "${name}"? Products using it keep the label until edited.`,
      confirmLabel: "Delete",
      variant: "danger",
      onConfirm: () => {
        setCategories((prev) => prev.filter((c) => c.id !== id));
        showToast(`Category "${name}" removed.`);
      },
    });
  };

  const handleDeleteTag = (id: string, name: string) => {
    notice.showConfirm({
      title: "Delete tag?",
      message: `Remove tag "${name}" from the store?`,
      confirmLabel: "Delete",
      variant: "danger",
      onConfirm: () => {
        setTags((prev) => prev.filter((t) => t.id !== id));
        showToast(`Tag "${name}" removed.`);
      },
    });
  };

  const filteredCategories = categories.filter(
    (c) =>
      c.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      c.description.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const filteredTags = tags.filter((t) =>
    t.name.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const modalTitle =
    editKind === "category"
      ? editingId
        ? "Edit Category"
        : "Create Category"
      : editingId
        ? "Edit Tag"
        : "Create Tag";

  return (
    <div className="space-y-6">
      {successToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-850 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 z-50">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-bold font-sans tracking-wide">{successToast}</span>
        </div>
      )}

      <div className="bg-gradient-to-r from-indigo-600 to-primary p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <FolderTree className="w-40 h-40" />
        </div>
        <span className="px-3 py-1 bg-white/10 rounded-full font-mono text-[10px] uppercase font-bold tracking-widest">
          Admin · Catalog taxonomy
        </span>
        <h2 className="font-display font-extrabold text-3xl tracking-tight mt-3 mb-1.5">
          Categories & Tags
        </h2>
        <p className="text-sm text-white/80 max-w-xl font-medium">
          Organize your store catalog with categories and product tags. Changes apply across inventory and online order builders.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveSection("categories")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeSection === "categories"
                ? "bg-white text-primary shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <FolderTree className="w-4 h-4" />
            Categories ({categories.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveSection("tags")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeSection === "tags"
                ? "bg-white text-primary shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Tags className="w-4 h-4" />
            Tags ({tags.length})
          </button>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder={`Search ${activeSection}...`}
              className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary"
            />
          </div>
          <button
            type="button"
            onClick={() => openCreate(activeSection === "categories" ? "category" : "tag")}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            Add {activeSection === "categories" ? "Category" : "Tag"}
          </button>
        </div>
      </div>

      {activeSection === "categories" ? (
        <div className="bg-white rounded-3xl border border-slate-150 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Color</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Name</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Description</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-semibold">
              {filteredCategories.map((cat) => (
                <tr key={cat.id} className="hover:bg-slate-50/40 transition-colors">
                  <td className="px-6 py-4">
                    <span
                      className="inline-block w-6 h-6 rounded-lg border border-slate-200"
                      style={{ backgroundColor: cat.color }}
                    />
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-800">{cat.name}</td>
                  <td className="px-6 py-4 text-slate-500 font-medium">{cat.description || "—"}</td>
                  <td className="px-6 py-4 text-right space-x-1">
                    <button
                      type="button"
                      onClick={() => openEditCategory(cat)}
                      className="p-1 px-2.5 bg-slate-50 hover:bg-indigo-50 border border-slate-200 text-slate-600 hover:text-indigo-600 rounded-lg transition-colors inline-flex items-center gap-1 font-bold text-[10px] cursor-pointer"
                    >
                      <Edit3 className="w-3 h-3" /> Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteCategory(cat.id, cat.name)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors inline-block cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredCategories.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-12 text-slate-400 font-bold">
                    No categories match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-150 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Color</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tag Name</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-semibold">
              {filteredTags.map((tag) => (
                <tr key={tag.id} className="hover:bg-slate-50/40 transition-colors">
                  <td className="px-6 py-4">
                    <span
                      className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold text-white"
                      style={{ backgroundColor: tag.color }}
                    >
                      {tag.name}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-800">{tag.name}</td>
                  <td className="px-6 py-4 text-right space-x-1">
                    <button
                      type="button"
                      onClick={() => openEditTag(tag)}
                      className="p-1 px-2.5 bg-slate-50 hover:bg-indigo-50 border border-slate-200 text-slate-600 hover:text-indigo-600 rounded-lg transition-colors inline-flex items-center gap-1 font-bold text-[10px] cursor-pointer"
                    >
                      <Edit3 className="w-3 h-3" /> Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteTag(tag.id, tag.name)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors inline-block cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredTags.length === 0 && (
                <tr>
                  <td colSpan={3} className="text-center py-12 text-slate-400 font-bold">
                    No tags match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-xl p-6 sm:p-8 shadow-2xl border border-slate-100 relative max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={closeModal}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
            >
              <span className="text-base font-bold font-mono">✕</span>
            </button>

            <h3 className="font-display text-lg font-black text-slate-800 mb-2 flex items-center gap-2">
              {editKind === "category" ? (
                <FolderTree className="text-primary w-5 h-5" />
              ) : (
                <Tags className="text-indigo-600 w-5 h-5" />
              )}
              {modalTitle}
            </h3>
            <p className="text-xs text-slate-400 font-medium mb-6 leading-relaxed">
              {editKind === "category"
                ? "Categories group products in catalog and filters."
                : "Tags label products for promotions, dietary info, and quick filtering."}
            </p>

            <form onSubmit={handleSubmit} className="space-y-5 text-xs font-semibold">
              <div>
                <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1.5">Name</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder={editKind === "category" ? "e.g. Beverages" : "e.g. Best Seller"}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:ring-2 focus:ring-primary/10 focus:border-primary"
                />
              </div>

              {editKind === "category" && (
                <div>
                  <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1.5">Description</label>
                  <textarea
                    rows={2}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Short description for staff reference"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:ring-2 focus:ring-primary/10 focus:border-primary"
                  />
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1.5">Color</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {COLOR_PRESETS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setFormColor(c)}
                      className={`w-8 h-8 rounded-lg border-2 transition-all cursor-pointer ${
                        formColor === c ? "border-slate-900 scale-110" : "border-transparent"
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
                <input
                  type="color"
                  value={formColor}
                  onChange={(e) => setFormColor(e.target.value)}
                  className="w-full h-10 rounded-lg border border-slate-200 cursor-pointer"
                />
              </div>

              <button
                type="submit"
                className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold tracking-wider shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                {editingId ? "Save Changes" : `Create ${editKind === "category" ? "Category" : "Tag"}`}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
