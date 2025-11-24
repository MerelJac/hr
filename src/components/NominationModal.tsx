"use client";

import { formatDateLocal } from "@/lib/formatDate";
import { Challenge } from "@/types/challenge";
import { LightUser } from "@/types/user";
import { Rocket } from "lucide-react";
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
  const [activeChallenge, setActiveChallenge] = useState<Challenge | null>(
    null
  );

  // form state
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
    // 1️⃣ Upload screenshot if needed
    if (activeChallenge.requirements?.requiresScreenshot && screenshotFile) {
      // get a presigned URL from your API
      const signRes = await fetch(
        `/api/util/images?contentType=${encodeURIComponent(
          screenshotFile.type
        )}`
      );

      if (!signRes.ok) {
        let errorMsg = "Failed to get upload URL";
        try {
          const errJson = await signRes.json();
          errorMsg = errJson.error || errorMsg;
        } catch {
          // if it's not valid JSON
          console.error("Something went wrong...", signRes);
        }
        setMessage(errorMsg);
        return;
      }
      const { uploadUrl, publicUrl } = await signRes.json();

      // upload directly to S3
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

    // 2️⃣ Now submit the nomination JSON
    const body = {
      challengeId: activeChallenge.id,
      nomineeId,
      reason,
      screenshot,
    };

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
        className="rounded-lg border-2 border-white bg-red-600 text-white px-3 py-2 flex items-center gap-2 justify-center"
        title={
          challenges.length === 0
            ? "No active challenges or nominations"
            : undefined
        }
      >
        <Rocket size={18} />
        Challenges & Nominations
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                Active Challenges & Nominations
              </h2>
              {message && (
                <div className="text-red-600 text-sm mr-4">{message}</div>
              )}
              <button onClick={() => setOpen(false)} className="text-gray-500">
                ✕
              </button>
            </div>

            {/* List of challenges */}
            {!activeChallenge ? (
              challenges.length === 0 ? (
                <div className="text-center text-gray-600 py-10 text-lg">
                  🚀 No active challenges or nominations!
                </div>
              ) : (
                <ul className="space-y-4">
                  {challenges.map((c) => (
                    <li
                      key={c.id}
                      className="border rounded-lg p-4 bg-gray-50 space-y-2"
                    >
                      <h3 className="font-semibold">{c.title}</h3>
                      <p className="text-sm text-gray-600">{c.description}</p>
                      <p className="text-xs text-gray-500">
                        Eligible: {formatDateLocal(c.startDate)} –{" "}
                        {formatDateLocal(c.endDate)}
                      </p>
                      <p className="text-xs text-gray-700">
                        Points: {c.points}
                      </p>
                      {c.gifUrl && (
                        <Image
                          src={c.gifUrl}
                          alt="Challenge GIF"
                          width={200}
                          height={200}
                          unoptimized
                          className="max-h-40 rounded mt-2"
                        />
                      )}
                      {c.qualification && (
                        <p className="text-sm italic">{c.qualification}</p>
                      )}
                      <button
                        onClick={() => setActiveChallenge(c)}
                        className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm"
                      >
                        Submit
                      </button>
                    </li>
                  ))}
                </ul>
              )
            ) : (
              // Challenge submission form
              <form className="space-y-4" onSubmit={submitChallenge}>
                <h3 className="text-lg font-semibold">
                  {activeChallenge.title}
                </h3>
                <p className="text-sm text-gray-600">
                  {activeChallenge.description}
                </p>

                {activeChallenge.gifUrl && (
                  <Image
                    src={activeChallenge.gifUrl}
                    alt="Selected GIF"
                    width={150}
                    height={150}
                    unoptimized
                    className="max-h-40 rounded mt-2"
                  />
                )}

                {activeChallenge.requirements?.requiresNominee && (
                  <div>
                    <label className="block text-sm mb-1">Nominee</label>
                    <select
                      className="w-full border rounded px-2 py-1"
                      value={nomineeId}
                      onChange={(e) => setNomineeId(e.target.value)}
                      required
                    >
                      <option value="">Select a nominee</option>
                      {users.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.preferredName ??
                            `${u.firstName ?? ""} ${u.lastName ?? ""}`}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {activeChallenge.requirements?.requiresReason && (
                  <div>
                    <label className="block text-sm mb-1">
                      Briefly explain why you&#39;re claiming this challenge.
                    </label>
                    <textarea
                      className="w-full border rounded px-3 py-2"
                      rows={3}
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      required
                    />
                  </div>
                )}

                {activeChallenge.requirements?.requiresScreenshot && (
                  <div>
                    <label className="block text-sm mb-1">
                      Upload Screenshot
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        setScreenshotFile(
                          e.target.files ? e.target.files[0] : null
                        )
                      }
                    />
                  </div>
                )}

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveChallenge(null)}
                    className="px-4 py-2 border rounded"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded"
                  >
                    Submit
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
