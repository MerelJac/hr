"use client";
import { formatDateLocal } from "@/lib/formatDate";
import { Challenge } from "@/types/challenge";
import { LightUser } from "@/types/user";
import { ArrowLeft, Rocket, Star, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

export default function NominationModal({
  users,
  challenges = [],
}: {
  users: LightUser[];
  challenges: Challenge[];
}) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [activeChallenge, setActiveChallenge] = useState<Challenge | null>(null);
  const [nomineeId, setNomineeId] = useState("");
  const [reason, setReason] = useState("");
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);

  async function safeReadError(res: Response) {
    try {
      const ct = res.headers.get("content-type") || "";
      if (ct.includes("application/json")) {
        const j = await res.json();
        return j?.error || JSON.stringify(j);
      } else {
        const t = await res.text();
        return t || `HTTP ${res.status}`;
      }
    } catch {
      return `HTTP ${res.status}`;
    }
  }

  async function submitChallenge(e: React.FormEvent) {
    e.preventDefault();
    if (!activeChallenge) return;
    let screenshot: string | undefined;
    console.log("Screenshot:", screenshot);

    if (activeChallenge.requirements?.requiresScreenshot && screenshotFile) {
      const signRes = await fetch(
        `/api/util/images?contentType=${encodeURIComponent(screenshotFile.type)}`
      );
      if (!signRes.ok) {
        let errorMsg = "Failed to get upload URL";
        try {
          const errJson = await signRes.json();
          errorMsg = errJson.error || errorMsg;
        } catch {
          console.error("Something went wrong...", signRes);
        }
        setMessage(errorMsg);
        return;
      }
      const { uploadUrl, publicUrl } = await signRes.json();
      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": screenshotFile.type },
        body: screenshotFile,
      });
      if (!uploadRes.ok) {
        setMessage("Failed to upload screenshot");
        return;
      }
      screenshot = publicUrl;
    }

    const body = { challengeId: activeChallenge.id, nomineeId, reason, screenshot };
    const res = await fetch("/api/nominations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      setOpen(false);
      location.reload();
    } else {
      setMessage((await safeReadError(res)) || "Failed to submit");
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-xl bg-red-600 hover:bg-red-700 active:scale-[0.98] text-white px-4 py-2 text-sm font-medium transition-all shadow-sm"
        title={challenges.length === 0 ? "No active challenges or nominations" : undefined}
      >
        <Rocket size={16} />
        Challenges & Nominations
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                {activeChallenge && (
                  <button
                    type="button"
                    onClick={() => setActiveChallenge(null)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all mr-1"
                  >
                    <ArrowLeft size={16} />
                  </button>
                )}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-indigo-400">
                    {activeChallenge ? "Submit Entry" : "Active"}
                  </p>
                  <h2 className="text-base font-semibold text-gray-800 leading-tight">
                    {activeChallenge ? activeChallenge.title : "Challenges & Nominations"}
                  </h2>
                </div>
              </div>
              <button
                onClick={() => { setOpen(false); setActiveChallenge(null); setMessage(""); }}
                className="p-1.5 rounded-lg text-gray-300 hover:text-gray-500 hover:bg-gray-100 transition-all"
              >
                <X size={16} />
              </button>
            </div>

            {/* Error banner */}
            {message && (
              <div className="mx-6 mt-4 flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 text-xs px-3 py-2.5 rounded-xl">
                <span className="shrink-0">⚠</span>
                {message}
              </div>
            )}

            {/* Body */}
            <div className="overflow-y-auto flex-1 px-6 py-4">
              {!activeChallenge ? (
                challenges.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center">
                      <Rocket size={22} className="text-indigo-400" />
                    </div>
                    <p className="text-gray-500 text-sm">No active challenges or nominations right now.</p>
                  </div>
                ) : (
                  <ul className="space-y-3">
                    {challenges.map((c) => (
                      <li
                        key={c.id}
                        className="border border-gray-100 rounded-xl p-4 bg-gray-50 hover:bg-indigo-50/40 hover:border-indigo-100 transition-all space-y-2.5"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="font-semibold text-gray-800 text-sm">{c.title}</h3>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {formatDateLocal(c.startDate)} – {formatDateLocal(c.endDate)}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 bg-yellow-50 border border-yellow-100 rounded-lg px-2 py-1 shrink-0">
                            <Star size={12} className="text-yellow-400 fill-yellow-400" />
                            <span className="text-xs font-semibold text-yellow-600">{c.points}</span>
                          </div>
                        </div>

                        <p className="text-xs text-gray-600 leading-relaxed">{c.description}</p>

                        {c.qualification && (
                          <p className="text-xs italic text-gray-400">{c.qualification}</p>
                        )}

                        {c.gifUrl && (
                          <Image
                            src={c.gifUrl}
                            alt="Challenge GIF"
                            width={200}
                            height={200}
                            unoptimized
                            className="max-h-32 rounded-lg object-cover"
                          />
                        )}

                        <button
                          onClick={() => setActiveChallenge(c)}
                          className="text-xs font-medium bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white px-3 py-1.5 rounded-lg transition-all"
                        >
                          Submit Entry
                        </button>
                      </li>
                    ))}
                  </ul>
                )
              ) : (
                <form className="space-y-4" onSubmit={submitChallenge}>
                  <p className="text-sm text-gray-500 leading-relaxed">{activeChallenge.description}</p>

                  {activeChallenge.gifUrl && (
                    <Image
                      src={activeChallenge.gifUrl}
                      alt="Challenge GIF"
                      width={150}
                      height={150}
                      unoptimized
                      className="max-h-36 rounded-xl object-cover"
                    />
                  )}

                  {activeChallenge.requirements?.requiresNominee && (
                    <div className="space-y-1.5">
                      <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Nominee
                      </label>
                      <select
                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent transition bg-white"
                        value={nomineeId}
                        onChange={(e) => setNomineeId(e.target.value)}
                        required
                      >
                        <option value="">Select a nominee…</option>
                        {users.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.preferredName
                              ? `${u.preferredName} ${u.lastName ?? ""}`
                              : `${u.firstName ?? ""} ${u.lastName ?? ""}`}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {activeChallenge.requirements?.requiresReason && (
                    <div className="space-y-1.5">
                      <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Why are you claiming this challenge?
                      </label>
                      <textarea
                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent transition resize-none"
                        rows={3}
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Briefly describe your entry…"
                        required
                      />
                    </div>
                  )}

                  {activeChallenge.requirements?.requiresScreenshot && (
                    <div className="space-y-1.5">
                      <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Screenshot
                      </label>
                      <label className="flex items-center gap-3 border border-dashed border-gray-200 hover:border-indigo-300 bg-gray-50 hover:bg-indigo-50/40 rounded-xl px-4 py-3 cursor-pointer transition-all">
                        <span className="text-xs text-gray-400">
                          {screenshotFile ? screenshotFile.name : "Click to upload an image…"}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => setScreenshotFile(e.target.files ? e.target.files[0] : null)}
                        />
                      </label>
                    </div>
                  )}

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setActiveChallenge(null)}
                      className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 hover:border-gray-300 rounded-xl transition-all"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white rounded-xl transition-all"
                    >
                      Submit Entry
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}