"use client";

import { Reward } from "@/types/reward";
import { useState } from "react";
import Image from "next/image";
import { Edit, Trash } from "lucide-react";

type RewardCategory = {
  id: string;
  name: string;
};

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
  const [imageUrl, setImageUrl] = useState<string | null>(
    selected?.imageUrl ?? null
  );

  async function saveCategory(data: Partial<RewardCategory>) {
    const method = selectedCat?.id ? "PATCH" : "POST";
    const url = selectedCat?.id
      ? `/api/rewards/categories/${selectedCat.id}`
      : "/api/rewards/categories";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) location.reload();
    else alert("Failed to save category");
  }

  async function deleteCategory(id: string) {
    if (!confirm("Delete this category permanently?")) return;
    const res = await fetch(`/api/rewards/categories/${id}`, {
      method: "DELETE",
    });
    if (res.ok) location.reload();
    else alert("Failed to delete category");
  }

  async function saveReward(data: Partial<Reward>) {
    const method = selected?.id ? "PATCH" : "POST";
    const url = selected?.id ? `/api/rewards/${selected.id}` : "/api/rewards";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
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
      if (!file) return;
      const res = await fetch(
        `/api/util/images?contentType=${encodeURIComponent(file.type)}`
      );
      const { uploadUrl, publicUrl } = await res.json();
      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!uploadRes.ok) throw new Error("S3 upload failed");
      setImageUrl(publicUrl);
    } catch (err) {
      console.error(err);
    }
  }

  // Group rewards by category
  const groupedRewards = categories.map((cat) => ({
    ...cat,
    rewards: rewards.filter((r) => r.categoryId === cat.id),
  }));

  return (
    <main className="p-6 bg-white rounded-xl space-y-8">
      {/* Category Controls */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Reward Categories</h2>
          <div className="flex justify-end gap-6">
            <button
              onClick={() => {
                setSelectedCat(null);
                setCatOpen(true);
              }}
              className="bg-blue-600 text-white px-3 py-2 rounded-xl"
            >
              + Add Category
            </button>

            {/* Reward Add button */}
            <button
              onClick={() => {
                setSelected(null);
                setOpen(true);
              }}
              className="bg-green-600 text-white px-4 py-2 rounded-xl shadow"
            >
              + Add Reward
            </button>
          </div>
        </div>

        {/* Category list with sublists of rewards */}
        <div className="divide-y border rounded-xl">
          {groupedRewards.map((cat) => (
            <details key={cat.id} className="group">
              <summary className="cursor-pointer flex justify-between items-center p-4 hover:bg-gray-50">
                <span className="font-semibold text-gray-800">{cat.name}</span>
                <div className="flex gap-3">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setSelectedCat(cat);
                      setCatOpen(true);
                    }}
                    className="text-blue-600 hover:underline"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      deleteCategory(cat.id);
                    }}
                    className="text-red-600 hover:underline"
                  >
                    <Trash size={16} />
                  </button>
                </div>
              </summary>

              {/* Rewards under this category */}
              <ul className="p-4 space-y-3 bg-gray-50 border-t border-gray-100">
                {cat.rewards.length === 0 && (
                  <li className="text-sm text-gray-500 italic px-3 py-2">
                    No rewards in this category yet.
                  </li>
                )}
                {cat.rewards.map((r) => (
                  <li
                    key={r.id}
                    className="flex justify-between items-center bg-white p-3 rounded-md shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      {r.imageUrl && (
                        <Image
                          src={r.imageUrl}
                          alt={r.label}
                          width={80}
                          height={80}
                          className="rounded-md"
                        />
                      )}
                      <div>
                        <h3 className="font-medium text-gray-800">{r.label}</h3>
                        <p className="text-sm text-gray-600">
                          {r.category?.name === "Gift Card"
                            ? "Flexible amount"
                            : `${r.pointsCost} pts`}
                        </p>
                        <span
                          className={`inline-block mt-1 px-2 py-0.5 text-xs rounded-full font-medium ${
                            r.isActive
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {r.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          setSelected(r);
                          setOpen(true);
                        }}
                        className="text-blue-600 hover:underline"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => deleteReward(r.id)}
                        className="text-red-600 hover:underline"
                      >
                        <Trash size={16} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </details>
          ))}
        </div>
      </section>

      {/* Category Modal */}
      {catOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-4">
              {selectedCat ? "Edit Category" : "New Category"}
            </h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                saveCategory({ name: formData.get("name") as string });
              }}
              className="space-y-3"
            >
              <label className="block text-sm font-medium">Name</label>
              <input
                name="name"
                defaultValue={selectedCat?.name}
                placeholder="e.g. Gift Cards"
                className="w-full border rounded px-3 py-2"
                required
              />
              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setCatOpen(false)}
                  className="px-3 py-2 border rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-2 bg-blue-600 text-white rounded"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reward Modal */}
      {open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-lg">
            <h3 className="text-lg font-semibold mb-4">
              {selected ? "Edit Reward" : "New Reward"}
            </h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                console.log("form data", {
                  label: formData.get("label"),
                  categoryId: formData.get("categoryId"),
                  valueCents: formData.get("valueCents"),
                  pointsCost: formData.get("pointsCost"),
                  isActive: formData.get("isActive"),
                  imageUrl: imageUrl,
                });
                saveReward({
                  label: formData.get("label") as string,
                  categoryId: formData.get("categoryId") as string,
                  valueCents: Number(formData.get("valueCents")) ?? 0,
                  pointsCost: Number(formData.get("pointsCost")),
                  isActive: formData.get("isActive") === "on",
                  imageUrl,
                });
              }}
              className="space-y-3"
            >
              <label className="block text-sm font-medium">Label</label>
              <input
                name="label"
                defaultValue={selected?.label}
                placeholder="e.g. Amazon Gift Card"
                className="w-full border rounded px-3 py-2"
                required
              />
              <label className="block text-sm font-medium">Category</label>
              <select
                name="categoryId"
                defaultValue={selected?.categoryId ?? categories[0]?.id}
                className="w-full border rounded px-3 py-2"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <label className="block text-sm font-medium">Points Cost</label>
              <input
                type="number"
                name="pointsCost"
                defaultValue={selected?.pointsCost ?? 0}
                className="w-full border rounded px-3 py-2"
                required
              />
              <label className="block text-sm font-medium">Image</label>
              {imageUrl && (
                <div className="mb-2">
                  <Image
                    src={imageUrl}
                    alt="Reward Image"
                    width={80}
                    height={80}
                    className="rounded-md"
                  />
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files?.[0]) uploadRewardImage(e.target.files[0]);
                }}
              />
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="isActive"
                  defaultChecked={selected?.isActive ?? true}
                />
                Active
              </label>
              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="px-3 py-2 border rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-2 bg-blue-600 text-white rounded"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
