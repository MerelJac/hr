"use client";

import { useState } from "react";

type RewardCategory = {
  id: string;
  name: string;
};

type Reward = {
  id: string;
  categoryId: string;
  category: RewardCategory;
  label: string;
  valueCents: number;
  pointsCost: number;
  isActive: boolean;
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

  // 🔹 CATEGORY CRUD
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
    const res = await fetch(`/api/rewards/categories/${id}`, { method: "DELETE" });
    if (res.ok) location.reload();
    else alert("Failed to delete category");
  }

  // 🔹 REWARD CRUD
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

  return (
    <main className="p-6 space-y-8 bg-white rounded-xl">
      {/* Categories Section */}
      <section>
        <h2 className="text-xl font-semibold mb-3">Reward Categories</h2>
        <button
          onClick={() => {
            setSelectedCat(null);
            setCatOpen(true);
          }}
          className="bg-blue-600 text-white px-3 py-2 rounded-xl mb-3"
        >
          + Add Category
        </button>
        <ul className="divide-y border rounded-xl">
          {categories.map((cat) => (
            <li
              key={cat.id}
              className="p-3 flex justify-between items-center"
            >
              <span>{cat.name}</span>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setSelectedCat(cat);
                    setCatOpen(true);
                  }}
                  className="text-blue-600 hover:underline"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteCategory(cat.id)}
                  className="text-red-600 hover:underline"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Rewards Section */}
      <section>
        <h2 className="text-xl font-semibold mb-3">Rewards</h2>
        <button
          onClick={() => {
            setSelected(null);
            setOpen(true);
          }}
          className="bg-blue-600 text-white px-3 py-2 rounded-xl mb-3"
        >
          + Add Reward
        </button>
        <ul className="divide-y border rounded-xl">
          {rewards.map((r) => (
            <li key={r.id} className="p-4 flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{r.label}</h3>
                <p className="text-sm text-gray-600">
                  Category: {r.category?.name}
                </p>
                <p className="text-sm">
                  Value: ${(r.valueCents / 100).toFixed(2)} | Cost:{" "}
                  {r.pointsCost} pts
                </p>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    r.isActive
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {r.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setSelected(r);
                    setOpen(true);
                  }}
                  className="text-blue-600 hover:underline"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteReward(r.id)}
                  className="text-red-600 hover:underline"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
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
                const form = e.currentTarget as HTMLFormElement;
                const formData = new FormData(form);
                saveCategory({ name: formData.get("name") as string });
              }}
              className="space-y-3"
            >
              <label>Name</label>
              <input
                name="name"
                defaultValue={selectedCat?.name}
                placeholder="e.g. Gift Cards"
                className="w-full border rounded px-3 py-2"
                required
              />
              <div className="flex justify-end gap-2">
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
                const form = e.currentTarget as HTMLFormElement;
                const formData = new FormData(form);
                saveReward({
                  label: formData.get("label") as string,
                  categoryId: formData.get("categoryId") as string,
                  valueCents: Number(formData.get("valueCents")) ?? 0, // defauly 0 
                  pointsCost: Number(formData.get("pointsCost")),
                  isActive: formData.get("isActive") === "on",
                });
              }}
              className="space-y-3"
            >
              <label>Label</label>
              <input
                name="label"
                defaultValue={selected?.label}
                placeholder="e.g. Amazon Gift Card"
                className="w-full border rounded px-3 py-2"
                required
              />
              <label>Category</label>
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
              <label>Value (Cents)</label>
              <input
                type="number"
                name="valueCents"
                defaultValue={selected?.valueCents ?? 0}
                className="w-full border rounded px-3 py-2"
                required
              />
              <label>Points Cost</label>
              <input
                type="number"
                name="pointsCost"
                defaultValue={selected?.pointsCost ?? 0}
                className="w-full border rounded px-3 py-2"
                required
              />
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="isActive"
                  defaultChecked={selected?.isActive ?? true}
                />
                Active
              </label>
              <div className="flex justify-end gap-2">
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
