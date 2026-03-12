"use client";
import { useState } from "react";
import { Copy, Trash, Edit, Rocket, X, Plus } from "lucide-react";
import Link from "next/link";
import GifPicker from "@/components/GifPicker";
import Image from "next/image";
import { Challenge } from "@/types/challenge";
import { formatDateLocal } from "@/lib/formatDate";

function inputClass() {
  return "w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 placeholder:text-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent transition";
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1.5">
      {children}
    </label>
  );
}

function Toggle({
  name,
  defaultChecked = false,
  label,
  description,
}: {
  name: string;
  defaultChecked?: boolean;
  label: string;
  description?: string;
}) {
  return (
    <label className="flex items-start gap-3 cursor-pointer">
      <div className="relative mt-0.5 shrink-0">
        <input
          type="checkbox"
          name={name}
          defaultChecked={defaultChecked}
          className="sr-only peer"
        />
        <div className="w-10 h-5 rounded-full border border-gray-200 bg-gray-100 peer-checked:bg-indigo-500 peer-checked:border-indigo-500 transition-all" />
        <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-all peer-checked:translate-x-5" />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-700">{label}</p>
        {description && (
          <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">
            {description}
          </p>
        )}
      </div>
    </label>
  );
}

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
        "Failed to save challenge. Check if name already exists or contact your developer.",
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
            <Rocket size={16} className="text-indigo-400" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
              Admin
            </p>
            <h1 className="text-lg font-semibold text-gray-800 leading-tight">
              Challenges
            </h1>
          </div>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white rounded-xl transition-all shadow-sm"
        >
          <Plus size={15} />
          Create Challenge
        </button>
      </div>

      {/* List */}
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        {challenges.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-14 text-center">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
              <Rocket size={18} className="text-gray-300" />
            </div>
            <p className="text-sm text-gray-400">
              No challenges yet. Create one to get started.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {challenges.map((c) => {
              const pendingCount =
                c.nominations?.filter((n) => n.status === "PENDING").length ??
                0;
              return (
                <li
                  key={c.id}
                  className="flex items-start justify-between gap-4 px-5 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0 mt-0.5">
                      <Rocket size={13} className="text-indigo-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-semibold text-gray-800">
                          {c.title}
                        </h3>
                        {pendingCount > 0 && (
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-500 text-white text-xs font-bold">
                            {pendingCount}
                          </span>
                        )}
                        <span
                          className={`text-xs font-medium px-2 py-0.5 rounded-lg border ${
                            c.isActive
                              ? "bg-green-50 border-green-100 text-green-600"
                              : "bg-gray-100 border-gray-200 text-gray-400"
                          }`}
                        >
                          {c.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5 truncate">
                        {c.description}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-gray-400">
                          {formatDateLocal(c.startDate)} –{" "}
                          {formatDateLocal(c.endDate)}
                        </span>
                        <span className="text-xs text-gray-300">·</span>
                        <span className="flex items-center gap-1 text-xs text-yellow-600 font-medium">
                          ⭐ {c.points} pts
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <Link href={`/admin/challenges/${c.id}`}>
                      <button className="px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-indigo-600 border border-gray-200 hover:border-indigo-200 hover:bg-indigo-50 rounded-lg transition-all">
                        View
                      </button>
                    </Link>
                    <button
                      onClick={() => openModal(c)}
                      className="p-1.5 rounded-lg text-gray-300 hover:text-indigo-500 hover:bg-indigo-50 transition-all"
                      title="Edit"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={() =>
                        openModal({ ...c, id: "", title: `${c.title} (Copy)` })
                      }
                      className="p-1.5 rounded-lg text-gray-300 hover:text-purple-500 hover:bg-purple-50 transition-all"
                      title="Duplicate"
                    >
                      <Copy size={14} />
                    </button>
                    <button
                      onClick={() => deleteChallenge(c.id)}
                      className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all"
                      title="Delete"
                    >
                      <Trash size={14} />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh] overflow-hidden">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-indigo-400">
                  {selected?.id ? "Edit" : "New"}
                </p>
                <h2 className="text-base font-semibold text-gray-800 leading-tight">
                  {selected?.id ? "Edit Challenge" : "Create Challenge"}
                </h2>
              </div>
              <button
                onClick={closeModal}
                className="p-1.5 rounded-lg text-gray-300 hover:text-gray-500 hover:bg-gray-100 transition-all"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal body */}
            <div className="overflow-y-auto flex-1 px-6 py-5">
              <form
                id="challenge-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.currentTarget as HTMLFormElement;
                  const fd = new FormData(form);
                  saveChallenge({
                    title: fd.get("title") as string,
                    description: fd.get("description") as string,
                    qualification: fd.get("qualification") as string,
                    startDate: fd.get("startDate") as string,
                    endDate: fd.get("endDate") as string,
                    isActive: fd.get("isActive") === "on",
                    gifUrl,
                    points: Number(fd.get("points")),
                    requirements: {
                      requiresNominee: fd.get("requiresNominee") === "on",
                      requiresReason: fd.get("requiresReason") === "on",
                      requiresScreenshot: fd.get("requiresScreenshot") === "on",
                    },
                    allowMultipleWinners:
                      fd.get("allowMultipleWinners") === "on",
                    hideStatusFromSubmitter:
                      fd.get("hideStatusFromSubmitter") === "on",
                  });
                }}
                className="space-y-4"
              >
                <div>
                  <FieldLabel>Title</FieldLabel>
                  <input
                    name="title"
                    defaultValue={selected?.title}
                    placeholder="Challenge title"
                    className={inputClass()}
                    required
                  />
                </div>

                <div>
                  <FieldLabel>Description</FieldLabel>
                  <textarea
                    name="description"
                    defaultValue={selected?.description || ""}
                    placeholder="Describe this challenge…"
                    className={inputClass()}
                    rows={3}
                  />
                </div>

                <div>
                  <FieldLabel>Qualification Criteria</FieldLabel>
                  <textarea
                    name="qualification"
                    defaultValue={selected?.qualification || ""}
                    placeholder="Who qualifies?"
                    className={inputClass()}
                    rows={2}
                  />
                </div>

                <div>
                  <FieldLabel>GIF</FieldLabel>
                  <GifPicker onSelect={(url) => setGifUrl(url)} />
                  {gifUrl && (
                    <div className="mt-2 relative max-w-fit">
                      <Image
                        src={gifUrl}
                        alt="Selected GIF"
                        width={150}
                        height={150}
                        unoptimized
                        className="max-h-36 rounded-xl border border-gray-100"
                      />
                      <button
                        type="button"
                        onClick={() => setGifUrl(null)}
                        className="absolute top-1 right-1 bg-black/60 hover:bg-black/80 text-white text-xs px-2 py-0.5 rounded-md transition"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <FieldLabel>Eligible Between</FieldLabel>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      name="startDate"
                      defaultValue={
                        selected?.startDate
                          ? new Date(selected.startDate)
                              .toISOString()
                              .split("T")[0]
                          : ""
                      }
                      className={inputClass()}
                      required
                    />
                    <input
                      type="date"
                      name="endDate"
                      defaultValue={
                        selected?.endDate
                          ? new Date(selected.endDate)
                              .toISOString()
                              .split("T")[0]
                          : ""
                      }
                      className={inputClass()}
                      required
                    />
                  </div>
                </div>

                <div>
                  <FieldLabel>Points</FieldLabel>
                  <input
                    type="number"
                    name="points"
                    defaultValue={selected?.points ?? 0}
                    className={inputClass()}
                    required
                  />
                </div>

                <div className="space-y-3 pt-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Requirements
                  </p>
                  <Toggle
                    name="requiresNominee"
                    defaultChecked={
                      selected?.requirements?.requiresNominee ?? false
                    }
                    label="Requires Nominee"
                  />
                  <Toggle
                    name="requiresReason"
                    defaultChecked={
                      selected?.requirements?.requiresReason ?? false
                    }
                    label="Requires Reason or Explanation"
                  />
                  <Toggle
                    name="requiresScreenshot"
                    defaultChecked={
                      selected?.requirements?.requiresScreenshot ?? false
                    }
                    label="Requires Screenshot"
                  />
                </div>

                <div className="space-y-3 pt-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Options
                  </p>
                  <Toggle
                    name="hideStatusFromSubmitter"
                    defaultChecked={
                      selected ? selected.hideStatusFromSubmitter : true
                    }
                    label="Hide Status From Submitter"
                    description="Users will only see that they submitted — not whether they won. Useful for Employee of the Quarter."
                  />
                  <Toggle
                    name="allowMultipleWinners"
                    defaultChecked={
                      selected ? selected.allowMultipleWinners : true
                    }
                    label="Allow Multiple Winners"
                    description="Multiple people can be awarded for the same challenge."
                  />
                  <Toggle
                    name="isActive"
                    defaultChecked={selected?.isActive ?? true}
                    label="Active"
                    description="Plan ahead by saving as inactive. Announcement emails send automatically when the challenge goes live, or manually via the challenge page."
                  />
                </div>
              </form>
            </div>

            {/* Modal footer */}
            <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-100 shrink-0">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 hover:border-gray-300 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="challenge-form"
                className="px-4 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white rounded-xl transition-all"
              >
                {selected?.id ? "Save Changes" : "Create Challenge"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
