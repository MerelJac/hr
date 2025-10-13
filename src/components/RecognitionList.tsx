"use client";

import React from "react";
import Image from "next/image";
import CommentList from "@/components/CommentList";
import { User } from "@/types/user";
import { Recognition } from "@/types/recognition";

type Props = {
  recs: Recognition[];
  users: User[];
};

export default function RecognitionList({ recs, users }: Props) {
  function getName(u: User) {
    const full = [u.firstName, u.lastName].filter(Boolean).join(" ");
    return full || u.email;
  }

  return (
    <ul className="space-y-6">
      {recs.map((r) => (
        <React.Fragment key={r.id}>
          <li className="bg-white rounded-t-xl p-4 border border-gray-100 mb-0">
            {/* 🧑‍🤝‍🧑 Recipients + points */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                {r.recipients.map((rr, i) => (
                  <div key={rr.id} className="flex items-center gap-2">
                    <Image
                      src={
                        rr.recipient.profileImage ??
                        "/default-profile-image.svg"
                      }
                      alt="Profile"
                      width={64}
                      height={64}
                      className="rounded-full w-12 h-12 border-2 border-blue-500"
                    />
                    <b className="text-gray-900 text-sm sm:text-base">
                      {getName(rr.recipient)}
                    </b>
                    {i < r.recipients.length - 1 ? <span>,</span> : null}
                  </div>
                ))}
              </div>

              <span className="text-xs sm:text-sm px-3 py-1 bg-green text-white rounded-lg font-semibold">
                +{r.recipients.reduce((a, b) => a + b.points, 0)} pts
              </span>
            </div>

            {/* ✉️ Sender */}
            <div className="text-sm text-gray-600 flex flex-wrap items-center gap-2 mt-2">
              recognized by
              <Image
                src={r.sender.profileImage ?? "/default-profile-image.svg"}
                alt="Profile"
                width={28}
                height={28}
                className="rounded-full w-8 h-8 border-2 border-blue-500"
              />
              <b>{getName(r.sender)}</b>
            </div>

            {/* 📬 Message */}
            <p className="mt-3 text-gray-800 text-sm sm:text-base leading-relaxed">
              {r.message}
              {r.gifUrl && (
                <Image
                  width={160}
                  height={160}
                  src={r.gifUrl}
                  alt="shoutout gif"
                  className="mt-3 rounded-lg max-h-60 w-auto mx-auto"
                />
              )}
            </p>

            {/* 🗓️ Date */}
            <small className="text-gray-500 block mt-3">
              {new Date(r.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </small>
          </li>

          {/* 💬 Comments */}
          <CommentList
            recognitionId={r.id}
            users={users}
            defaultRecipientId={r.recipients[0]?.recipient?.id}
          />
        </React.Fragment>
      ))}
    </ul>
  );
}
