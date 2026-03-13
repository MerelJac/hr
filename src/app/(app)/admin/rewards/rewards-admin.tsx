"use client";

import { Reward } from "@/types/reward";
import { useState } from "react";
import Image from "next/image";
import { ChevronRight, Edit, Gift, Plus, Tag, Trash, X } from "lucide-react";

type RewardCategory = { id: string; name: string };

function inputClass() {
  return "w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 placeholder:text-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent transition";
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="block text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1.5">{children}</label>;
}

function Modal({
  open,
  onClose,
  eyebrow,
  title,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  eyebrow: string;
  title: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-indigo-400">{eyebrow}</p>
            <h2 className="text-base font-semibold text-gray-800 leading-tight">{title}</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-300 hover:text-gray-500 hover:bg-gray-100 transition-all">
            <X size={16} />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 px-6 py-5">{children}</div>
        <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-100 shrink-0">{footer}</div>
      </div>
    </div>
  );
}

export default function RewardsAdmin({
  rewards,
  categories,
}: {
  rewards: Reward[];
  categories: RewardCategory[];
}) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Reward | null>(null);
  const [catOpen, setCatOpen] = useState(false);
  const [selectedCat, setSelectedCat] = useState<RewardCategory | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  async function saveCategory(data: Partial<RewardCategory>) {
    const method = selectedCat?.id ? "PATCH" : "POST";
    const url = selectedCat?.id ? `/api/rewards/categories/${selectedCat.id}` : "/api/rewards/categories";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    if (res.ok) location.reload();
    else alert("Failed to save category");
  }

  async function deleteCategory(id: string) {
    if (!confirm("Delete this category permanently?")) return;
    const res = await fetch(`/api/rewards/categories/${id}`, { method: "DELETE" });
    if (res.ok) location.reload();
    else alert("Failed to delete category");
  }

  async function saveReward(data: Partial<Reward>) {
    const method = selected?.id ? "PATCH" : "POST";
    const url = selected?.id ? `/api/rewards/${selected.id}` : "/api/rewards";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    if (res.ok) location.reload();
    else alert("Failed to save reward");
  }

  async function deleteReward(id: string) {
    if (!confirm("Delete this reward permanently?")) return;
    const res = await fetch(`/api/rewards/${id}`, { method: "DELETE" });
    if (res.ok) location.reload();
    else alert("Failed to delete reward");
  }

  async function uploadRewardImage(file: File) {
    try {
      const res = await fetch(`/api/util/images?contentType=${encodeURIComponent(file.type)}`);
      const { uploadUrl, publicUrl } = await res.json();
      const uploadRes = await fetch(uploadUrl, { method: "PUT", headers: { "Content-Type": file.type }, body: file });
      if (!uploadRes.ok) throw new Error("S3 upload failed");
      setImageUrl(publicUrl);
    } catch (err) {
      console.log(err);
    }
  }

  const groupedRewards = categories.map((cat) => ({
    ...cat,
    rewards: rewards.filter((r) => r.categoryId === cat.id),
  }));

  return (
    <div className="space-y-4">
      {/* Header actions */}
      <div className="flex items-center justify-end gap-2">
        <button
          onClick={() => { setSelectedCat(null); setCatOpen(true); }}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-500 hover:text-indigo-600 border border-gray-200 hover:border-indigo-200 hover:bg-indigo-50 rounded-xl transition-all"
        >
          <Tag size={12} /> Add Category
        </button>
        <button
          onClick={() => { setSelected(null); setImageUrl(null); setOpen(true); }}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white rounded-xl transition-all"
        >
          <Plus size={13} /> Add Reward
        </button>
      </div>

      {/* Category list */}
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        {groupedRewards.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-12 text-center">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
              <Gift size={18} className="text-gray-300" />
            </div>
            <p className="text-sm text-gray-400">No categories yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {groupedRewards.map((cat) => (
              <details key={cat.id} className="group">
                <summary className="cursor-pointer flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors list-none">
                  <div className="flex items-center gap-2.5">
                    <ChevronRight size={14} className="text-gray-300 transition-transform duration-200 group-open:rotate-90 shrink-0" />
                    <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
                      <Tag size={12} className="text-indigo-400" />
                    </div>
                    <span className="text-sm font-semibold text-gray-700">{cat.name}</span>
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{cat.rewards.length}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => { e.preventDefault(); setSelectedCat(cat); setCatOpen(true); }}
                      className="p-1.5 rounded-lg text-gray-300 hover:text-indigo-500 hover:bg-indigo-50 transition-all"
                    >
                      <Edit size={13} />
                    </button>
                    <button
                      onClick={(e) => { e.preventDefault(); deleteCategory(cat.id); }}
                      className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all"
                    >
                      <Trash size={13} />
                    </button>
                  </div>
                </summary>

                <div className="bg-gray-50 border-t border-gray-100 px-5 py-3 space-y-2">
                  {cat.rewards.length === 0 ? (
                    <p className="text-xs text-gray-400 italic py-1">No rewards in this category yet.</p>
                  ) : (
                    cat.rewards.map((r) => (
                      <div key={r.id} className="flex items-center justify-between gap-3 bg-white border border-gray-100 rounded-xl px-4 py-3">
                        <div className="flex items-center gap-3 min-w-0">
                          {r.imageUrl && (
                            <Image src={r.imageUrl} alt={r.label} width={40} height={40} className="rounded-lg object-contain shrink-0" />
                          )}
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-800 truncate">{r.label}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs text-gray-400">
                                {r.category?.name === "Gift Card" && r.pointsCost === 0 ? "Flexible" : `${r.pointsCost} pts`}
                              </span>
                              <span className={`text-xs font-medium px-1.5 py-0.5 rounded-md border ${
                                r.isActive ? "bg-green-50 border-green-100 text-green-600" : "bg-gray-100 border-gray-200 text-gray-400"
                              }`}>
                                {r.isActive ? "Active" : "Inactive"}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => { setSelected(r); setImageUrl(r.imageUrl ?? null); setOpen(true); }}
                            className="p-1.5 rounded-lg text-gray-300 hover:text-indigo-500 hover:bg-indigo-50 transition-all"
                          >
                            <Edit size={13} />
                          </button>
                          <button
                            onClick={() => deleteReward(r.id)}
                            className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all"
                          >
                            <Trash size={13} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </details>
            ))}
          </div>
        )}
      </div>

      {/* Category Modal */}
      <Modal
        open={catOpen}
        onClose={() => setCatOpen(false)}
        eyebrow={selectedCat ? "Edit" : "New"}
        title={selectedCat ? "Edit Category" : "New Category"}
        footer={
          <>
            <button type="button" onClick={() => setCatOpen(false)} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 hover:border-gray-300 rounded-xl transition-all">
              Cancel
            </button>
            <button type="submit" form="cat-form" className="px-4 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white rounded-xl transition-all">
              Save
            </button>
          </>
        }
      >
        <form
          id="cat-form"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            saveCategory({ name: fd.get("name") as string });
          }}
        >
          <FieldLabel>Category Name</FieldLabel>
          <input name="name" defaultValue={selectedCat?.name} placeholder="e.g. Gift Cards" className={inputClass()} required />
        </form>
      </Modal>

      {/* Reward Modal */}
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        eyebrow={selected ? "Edit" : "New"}
        title={selected ? "Edit Reward" : "New Reward"}
        footer={
          <>
            <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 hover:border-gray-300 rounded-xl transition-all">
              Cancel
            </button>
            <button type="submit" form="reward-form" className="px-4 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white rounded-xl transition-all">
              {selected ? "Save Changes" : "Create Reward"}
            </button>
          </>
        }
      >
        <form
          id="reward-form"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            saveReward({
              label: fd.get("label") as string,
              categoryId: fd.get("categoryId") as string,
              valueCents: Number(fd.get("valueCents")) ?? 0,
              pointsCost: Number(fd.get("pointsCost")),
              isActive: fd.get("isActive") === "on",
              imageUrl,
            });
          }}
          className="space-y-4"
        >
          <div>
            <FieldLabel>Label</FieldLabel>
            <input name="label" defaultValue={selected?.label} placeholder="e.g. Amazon Gift Card" className={inputClass()} required />
          </div>

          <div>
            <FieldLabel>Category</FieldLabel>
            <select name="categoryId" defaultValue={selected?.categoryId ?? categories[0]?.id} className={inputClass()}>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div>
            <FieldLabel>Points Cost</FieldLabel>
            <input type="number" name="pointsCost" defaultValue={selected?.pointsCost ?? 0} className={inputClass()} required />
          </div>

          <div>
            <FieldLabel>Image</FieldLabel>
            {imageUrl && (
              <div className="mb-2 flex items-center gap-3">
                <Image src={imageUrl} alt="Reward" width={56} height={56} className="rounded-xl border border-gray-100 object-contain" />
                <button type="button" onClick={() => setImageUrl(null)} className="text-xs text-red-500 hover:text-red-700 transition-colors">Remove</button>
              </div>
            )}
            <label className="flex items-center gap-3 border border-dashed border-gray-200 hover:border-indigo-300 bg-gray-50 hover:bg-indigo-50/40 rounded-xl px-4 py-3 cursor-pointer transition-all">
              <span className="text-xs text-gray-400">{imageUrl ? "Replace image…" : "Upload an image…"}</span>
              <input type="file" accept="image/*" className="hidden" onChange={(e) => { if (e.target.files?.[0]) uploadRewardImage(e.target.files[0]); }} />
            </label>
          </div>

          <div>
            <label className="flex items-start gap-3 cursor-pointer">
              <div className="relative mt-0.5">
                <input type="checkbox" name="isActive" defaultChecked={selected?.isActive ?? true} className="sr-only peer" />
                <div className="w-10 h-5 rounded-full border border-gray-200 bg-gray-100 peer-checked:bg-indigo-500 peer-checked:border-indigo-500 transition-all" />
                <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-all peer-checked:translate-x-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Active</p>
                <p className="text-xs text-gray-400 mt-0.5">Visible to users in the rewards catalog.</p>
              </div>
            </label>
          </div>
        </form>
      </Modal>
    </div>
  );
}