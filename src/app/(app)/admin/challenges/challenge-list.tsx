"use client";

import { useState } from "react";
import { Copy, Trash, Edit } from "lucide-react";
import Link from "next/link";
import GifPicker from "@/components/GifPicker";
import Image from "next/image";
type Challenge = {
  id: string;
  title: string;
  description?: string;
  qualification?: string;
  isActive: boolean;
  startDate: string;
  endDate: string;
  points: number;
  requirements?: {
    requiresNominee?: boolean;
    requiresReason?: boolean;
    requiresScreenshot?: boolean;
  };
  nominations?: { id: string; status: string }[];
};

export default function ChallengeList({
  challenges,
}: {
  challenges: Challenge[];
}) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Challenge | null>(null);
  const [gifUrl, setGifUrl] = useState<string | null>(null);

  function openModal(challenge?: Challenge) {
    setSelected(challenge || null);
    setGifUrl(challenge?.gifUrl ?? null);
    setOpen(true);
  }

  function closeModal() {
    setSelected(null);
    setOpen(false);
  }

  async function saveChallenge(data: Partial<Challenge>) {
    const method = selected?.id ? "PATCH" : "POST";
    const url = selected?.id
      ? `/api/challenges/${selected.id}`
      : "/api/challenges";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (res.ok) location.reload();
    else
      alert(
        "Failed to save challenge. Check if name already exists or contact your developer."
      );
  }

  async function deleteChallenge(id: string) {
    if (!confirm("Delete this challenge permanently?")) return;
    const res = await fetch(`/api/challenges/${id}`, { method: "DELETE" });
    if (res.ok) location.reload();
    else alert("Failed to delete challenge");
  }

  return (
    <section className="space-y-4 p-6">
      <button
        onClick={() => openModal()}
        className="bg-blue-600 text-white px-3 py-2 rounded-xl"
      >
        + Create Challenge
      </button>

      <ul className="divide-y border rounded-xl">
        {challenges.map((c) => {
          const pendingCount =
            c.nominations?.filter((n) => n.status === "PENDING").length ?? 0;

          return (
            <li
              key={c.id}
              className="p-4 flex items-center justify-between relative"
            >
              <div>
                <h3 className="font-semibold flex items-center gap-2">
                  {c.title}
                  {pendingCount > 0 && (
                    <span className="ml-2 inline-flex items-center justify-center rounded-full bg-red-600 text-white text-xs w-5 h-5">
                      {pendingCount}
                    </span>
                  )}
                </h3>
                <p className="text-sm text-gray-600">{c.description}</p>
                <p className="text-sm text-gray-600">Points: {c.points}</p>
                <p className="text-xs text-gray-500">
                  {new Date(c.startDate).toLocaleDateString()} -{" "}
                  {new Date(c.endDate).toLocaleDateString()}
                </p>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    c.isActive
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {c.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              <div className="flex gap-4">
                <Link href={`/admin/challenges/${c.id}`}>
                  <button className="text-gray-700 hover:underline">
                    View
                  </button>
                </Link>
                <button
                  onClick={() => openModal(c)}
                  className="text-blue-600 hover:underline"
                >
                  <Edit size={18} />
                </button>
                <button
                  onClick={() =>
                    openModal({
                      ...c,
                      id: "",
                      title: `${c.title} (Copy)`,
                    })
                  }
                  className="text-purple-600 hover:underline"
                >
                  <Copy size={18} />
                </button>
                <button
                  onClick={() => deleteChallenge(c.id)}
                  className="text-red-600 hover:underline"
                >
                  <Trash size={18} />
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      {open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-lg">
            <h2 className="text-xl font-semibold mb-4">
              {selected ? "Edit Challenge" : "New Challenge"}
            </h2>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget as HTMLFormElement;
                const formData = new FormData(form);

                saveChallenge({
                  title: formData.get("title") as string,
                  description: formData.get("description") as string,
                  qualification: formData.get("qualification") as string,
                  startDate: formData.get("startDate") as string,
                  endDate: formData.get("endDate") as string,
                  isActive: formData.get("isActive") === "on",
                  gifUrl: gifUrl,
                  points: Number(formData.get("points")),
                  requirements: {
                    requiresNominee: formData.get("requiresNominee") === "on",
                    requiresReason: formData.get("requiresReason") === "on",
                    requiresScreenshot:
                      formData.get("requiresScreenshot") === "on",
                  },
                });
              }}
              className="space-y-3"
            >
              <label>Title</label>
              <input
                name="title"
                defaultValue={selected?.title}
                placeholder="Title"
                className="w-full border rounded px-3 py-2"
                required
              />
              <label>Description</label>
              <textarea
                name="description"
                defaultValue={selected?.description || ""}
                placeholder="Description"
                className="w-full border rounded px-3 py-2"
              />
              <label>Qualification</label>
              <textarea
                name="qualification"
                defaultValue={selected?.qualification || ""}
                placeholder="Qualification criteria"
                className="w-full border rounded px-3 py-2"
              />
              <GifPicker onSelect={(url) => setGifUrl(url)} />
              <div className="">
                {gifUrl && (
                  <div className="mt-2 relative max-w-fit">
                    <Image
                      src={gifUrl}
                      alt="Selected GIF"
                      width={150} // required
                      height={150} // required
                      unoptimized // 👈 prevents Next from trying to optimize animated gifs
                      className="max-h-40 rounded"
                    />{" "}
                    <button
                      type="button"
                      onClick={() => setGifUrl(null)}
                      className="absolute top-1 right-1 bg-white/80 text-red-600 text-xs px-2 py-1 rounded"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
              <label>Eligable Between</label>
              <div className="flex gap-2">
                <input
                  type="date"
                  name="startDate"
                  defaultValue={
                    selected?.startDate
                      ? new Date(selected.startDate).toISOString().split("T")[0]
                      : ""
                  }
                  className="border rounded px-3 py-2 flex-1"
                  required
                />
                <input
                  type="date"
                  name="endDate"
                  defaultValue={
                    selected?.endDate
                      ? new Date(selected.endDate).toISOString().split("T")[0]
                      : ""
                  }
                  className="border rounded px-3 py-2 flex-1"
                  required
                />
              </div>
              <div className="flex flex-col">
                <label>Points</label>
                <input
                  type="number"
                  name="points"
                  defaultValue={selected?.points ?? 0}
                  className="border rounded px-3 py-2 flex-1"
                  required
                />
              </div>
              <label className="block font-semibold">Requirements</label>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="requiresNominee"
                    defaultChecked={
                      selected?.requirements?.requiresNominee ?? false
                    }
                  />
                  Requires Nominee
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="requiresReason"
                    defaultChecked={
                      selected?.requirements?.requiresReason ?? false
                    }
                  />
                  Requires Reason
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="requiresScreenshot"
                    defaultChecked={
                      selected?.requirements?.requiresScreenshot ?? false
                    }
                  />
                  Requires Screenshot
                </label>
              </div>

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
                  onClick={closeModal}
                  className="px-4 py-2 border rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
