"use client";
import React, { useState } from "react";
import Image from "next/image";
import CommentList from "@/components/CommentList";
import { User } from "@/types/user";
import { Recognition } from "@/types/recognition";
import { EllipsisVerticalIcon, Star } from "lucide-react";

const CORE_VALUE_MAP: Record<string, string> = {
  LIGHT: "🙌 Be the Light",
  RIGHT: "🏆 Do the Right Thing",
  SERVICE: "🤝 Selfless Service",
  PROBLEM: "💛 Proactive Positive Problem Solving",
  EVOLUTION: "🌱 Embrace Evolution",
};

type Props = {
  recs: Recognition[];
  users: User[];
  user: User;
};

export default function RecognitionList({ recs, users, user }: Props) {
  function getName(u: Pick<User, "firstName" | "lastName" | "email">) {
    const full = [u.firstName, u.lastName].filter(Boolean).join(" ");
    return full || u.email;
  }
  const [dropdownId, setDropdownId] = useState<string | null>(null);
  const [deleteText, setDeleteText] = useState("Delete");

  const toggleDropdown = (id: string) => {
    setDropdownId((prev) => (prev === id ? null : id));
  };

  async function deleteRecognition(id: string) {
    setDeleteText("Deleting...");
    const res = await fetch(
      `/api/recognitions/${encodeURIComponent(id)}?senderId=${user.id}`,
      {
        method: "DELETE",
      },
    );
    if (res.ok) location.reload();
    else alert((await res.json()).error || "Failed to remove recognition");
  }

  return (
    <ul className="space-y-4">
      {recs.map((r) => (
        <React.Fragment key={r.id}>
          <li className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-5">
              {/* Top row: recipients + points + menu */}
              <div className="flex flex-wrap items-start justify-between gap-3">
                {/* Recipients */}
                <div className="flex flex-wrap items-center gap-3">
                  {r.recipients.map((rr, i) => (
                    <div key={rr.id} className="flex items-center gap-2">
                      <Image
                        src={
                          rr.recipient.profileImage ??
                          "/default-profile-image.svg"
                        }
                        alt="Profile"
                        width={40}
                        height={40}
                        className="rounded-full w-10 h-10 border-2 border-indigo-200 object-cover"
                      />
                      <span className="font-semibold text-gray-800 text-sm">
                        {getName(rr.recipient)}
                      </span>
                      {i < r.recipients.length - 1 && (
                        <span className="text-gray-300 text-xs">·</span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Points + menu */}
                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex items-center gap-1 bg-yellow-50 border border-yellow-100 text-yellow-600 text-xs font-bold px-2.5 py-1.5 rounded-lg">
                    <Star
                      size={11}
                      className="fill-yellow-400 text-yellow-400"
                    />
                    +{r.recipients.reduce((a, b) => a + b.points, 0)}
                  </div>
                  {(user.role === "SUPER_ADMIN" || user.id === r.sender.id) && (
                    <div className="relative">
                      <button
                        onClick={() => toggleDropdown(r.id)}
                        className="p-1.5 rounded-lg text-gray-300 hover:text-gray-500 hover:bg-gray-100 transition-all"
                      >
                        <EllipsisVerticalIcon size={15} />
                      </button>
                      {dropdownId === r.id && (
                        <div className="absolute right-0 mt-1 bg-white shadow-lg border border-gray-100 rounded-xl py-1 z-10 min-w-[120px]">
                          <button
                            className="w-full text-left text-sm text-red-500 hover:bg-red-50 px-3 py-2 transition-colors"
                            onClick={() => deleteRecognition(r.id)}
                          >
                            {deleteText}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Sender */}
              <div className="flex items-center gap-2 mt-3">
                <span className="text-xs text-gray-400">recognized by</span>
                <Image
                  src={r.sender.profileImage ?? "/default-profile-image.svg"}
                  alt="Profile"
                  width={22}
                  height={22}
                  className="rounded-full w-5 h-5 border border-indigo-200 object-cover"
                />
                <span className="text-xs font-semibold text-gray-600">
                  {getName(r.sender)}
                </span>
              </div>

              {/* Message */}
              <p className="mt-3 text-gray-700 text-sm leading-relaxed max-w-3xl">
                {r.message}
              </p>

              {/* Core Value — only shown if present */}
              {r.coreValue && CORE_VALUE_MAP[r.coreValue] && (
                <span className="inline-flex items-center mt-3 text-xs font-semibold px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-200">
                  {CORE_VALUE_MAP[r.coreValue]}
                </span>
              )}

              {/* GIF */}
              {r.gifUrl && (
                <Image
                  width={160}
                  height={160}
                  src={r.gifUrl}
                  alt="shoutout gif"
                  unoptimized
                  className="mt-3 rounded-xl max-h-52 w-auto"
                />
              )}

              {/* Date */}
              <p className="text-xs text-gray-400 mt-3">
                {new Date(r.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>

            {/* Comments — flush to card bottom */}
            <div className="border-t border-gray-100">
              <CommentList
                recognitionId={r.id}
                users={users}
                defaultRecipientId={r.recipients[0]?.recipient?.id}
                user={user}
              />
            </div>
          </li>
        </React.Fragment>
      ))}
    </ul>
  );
}
