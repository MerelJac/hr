// src/app/(app)/admin/nominations/tabs-client.tsx
"use client";

import { useState } from "react";
import AdminActionButton from "@/components/AdminActionButton";

type Nom = {
  id: string;
  type: "EOM" | "LINKEDIN";
  status: "PENDING" | "APPROVED" | "REJECTED" | "WON" | "SKIPPED";
  submitter?: {
    email?: string | null;
    firstName?: string | null;
    lastName?: string | null;
  } | null;
  nominee?: {
    email?: string | null;
    firstName?: string | null;
    lastName?: string | null;
  } | null;
  reason?: string | null;
  caption?: string | null;
  postUrl?: string | null;
  createdAt: string | Date;
};

function displayName(u?: Nom["submitter"]) {
  if (!u) return "";
  const name = [u.firstName, u.lastName].filter(Boolean).join(" ");
  return name || (u.email ?? "");
}

function ItemCard(n: Nom) {
  const created = new Date(n.createdAt).toLocaleString("en-US", {
    timeZone: "UTC",
  });

  return (
    <li className="border-2 bg-white rounded-xl p-4 space-y-2">
      <div className="text-sm text-gray-600 flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
        <div>
          <b>Type:</b> {n.type} • <b>Status:</b> {n.status} • <b>By:</b>{" "}
          {displayName(n.submitter)} • {created}
        </div>
        {n.type === "EOM" && n.nominee && (
          <div>
            <b>Nominee:</b> {displayName(n.nominee)}
          </div>
        )}
      </div>

      {n.type === "LINKEDIN" && n.postUrl && (
        <div className="text-sm">
          <b>Post:</b>{" "}
          <a
            className="underline text-blue-600 break-all"
            href={n.postUrl}
            target="_blank"
            rel="noreferrer"
          >
            {n.postUrl}
          </a>
          {n.caption && <p className="mt-1">{n.caption}</p>}
        </div>
      )}

      {n.reason && (
        <p className="text-sm">
          <b>Reason:</b> {n.reason}
        </p>
      )}

      <div className="flex gap-2">
        {n.type === "LINKEDIN" && n.status === "PENDING" && (
          <>
            <AdminActionButton
              id={n.id}
              action="approve"
              label="Approve (+10 to submitter)"
            />
            <AdminActionButton
              id={n.id}
              action="reject"
              label="Reject"
              secondary
            />
          </>
        )}
        {n.type === "EOM" && n.status !== "WON" && (
          <>
            <AdminActionButton
              id={n.id}
              action="win"
              label="Mark Winner (+100 to nominee)"
            />
            <AdminActionButton id={n.id} action="skip" label="Skip" secondary />
          </>
        )}
      </div>
    </li>
  );
}

function Section({ title, items }: { title: string; items: Nom[] }) {
  return (
    <section className="space-y-2">
      <h3 className="text-sm font-semibold text-white">{title}</h3>
      {items.length ? (
        <ul className="space-y-3">
          {items.map((n) => (
            <ItemCard key={n.id} {...n} />
          ))}
        </ul>
      ) : (
        <div className="text-sm text-black bg-white border-2 rounded-xl p-3">
          Dang, no nominations.
        </div>
      )}
    </section>
  );
}

export default function TabsClient({
  eomCurrent,
  eomPast,
  liCurrent,
  liPast,
}: {
  eomCurrent: Nom[];
  eomPast: Nom[];
  liCurrent: Nom[];
  liPast: Nom[];
}) {
  const [tab, setTab] = useState<"EOM">("EOM");

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setTab("EOM")}
          className={`px-3 py-1 rounded-lg ${
            tab === "EOM" ? "bg-black text-white" : "bg-gray-100"
          }`}
        >
          Employee of the Month
        </button>
      </div>

      {/* Panels */}
      {tab === "EOM" ? (
        <div className="space-y-6">
          <Section title="Current Month" items={liCurrent} />
          <Section title="Past" items={liPast} />
        </div>
      ) : (
        <div className="space-y-6">
        </div>
      )}
    </div>
  );
}
