"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { ArrowRight, Spotlight } from "lucide-react";
import UserInsightsModal from "@/components/UserInsightsModal";
import AnnounceWinnersForm from "@/components/AnnounceWinnersForm";
import Link from "next/link";
import { formatDateLocal } from "@/lib/formatDate";

type ChallengeDetailProps = {
  challenge: {
    id: string;
    title: string;
    description?: string | null;
    qualification?: string | null;
    points: number;
    isActive: boolean;
    startDate: string | Date;
    endDate: string | Date;
    gifUrl: string | null;
    allowMultipleWinners?: boolean;
    hideStatusFromSubmitter?: boolean;
    nominations: {
      id: string;
      status: string;
      reason?: string;
      createdAt: string | Date;
      submitter?: {
        id: string;
        firstName?: string | null;
        lastName?: string | null;
        email?: string | null;
      } | null;
      nominee?: {
        id: string;
        firstName?: string | null;
        lastName?: string | null;
        email?: string | null;
      } | null;
    }[];
  };
  relatedRecognitions: {
    id: string;
    message: string;
    createdAt: Date;
    recipients: {
      recipient: {
        id: string;
        firstName?: string | null;
        lastName?: string | null;
        email?: string | null;
      };
      points: number;
    }[];
  }[];
};

export default function ChallengeDetailClient({
  challenge,
  relatedRecognitions,
}: ChallengeDetailProps) {
  const [isPending, startTransition] = useTransition();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [openAnnounceModal, setOpenAnnounceModal] = useState(false);
  console.log("console log challenge");
  async function updateStatus(
    id: string,
    status: "APPROVED" | "REJECTED" | "WON"
  ) {
    const res = await fetch(`/api/nominations/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    if (!res.ok) {
      alert("Failed to update status");
      return;
    }

    startTransition(() => window.location.reload());
  }

  return (
    <div>
      {/* === Challenge Overview === */}
      <div className="flex flex-row justify-between">
        <div className="flex flex-col">
          <h1 className="text-2xl font-semibold">{challenge.title}</h1>
          <p className="mt-1 text-gray-700">{challenge.description}</p>
          {challenge.allowMultipleWinners && (
            <p className="text-green mt-1">Allow Multiple Winners</p>
          )}
          {challenge.hideStatusFromSubmitter && (
            <p className="text-green mt-1">Hide Status From Submitters</p>
          )}
          {challenge.gifUrl && (
            <Image
              src={challenge.gifUrl}
              alt="Challenge GIF"
              width={150}
              height={150}
              unoptimized
              className="max-h-40 rounded mt-2"
            />
          )}

          <p className="text-sm text-gray-600 mt-2">
            {challenge.qualification}
          </p>
          <p className="text-xs text-gray-500">
            {formatDateLocal(challenge.startDate)} –{" "}
            {formatDateLocal(challenge.endDate)}
          </p>

          <span
            className={`inline-block mt-2 px-2 py-1 rounded text-xs w-fit font-medium ${
              challenge.isActive
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {challenge.isActive ? "Active" : "Inactive"}
          </span>
        </div>
        {challenge.allowMultipleWinners && (
          <button onClick={() => setOpenAnnounceModal(!openAnnounceModal)}>
            <span className="bg-blue-100 m-4 p-4 rounded ">
              📣 Announce Winners
            </span>
          </button>
        )}
      </div>
      {/* === Winner Announcement (for multiple winners) === */}
      {openAnnounceModal && (
        <AnnounceWinnersForm
          users={Array.from(
            new Map(
              challenge.nominations
                .filter((n) => n.nominee) // ✅ only those with nominees
                .map((n) => [
                  n.nominee!.id, // 👈 unique key to dedupe by
                  {
                    id: n.nominee!.id || "",
                    email: n.nominee!.email || "",
                    firstName: n.nominee!.firstName || "",
                    lastName: n.nominee!.lastName || "",
                  },
                ])
            ).values()
          )}
          challengeId={challenge.id}
          points={challenge.points}
        />
      )}
      {/* === Submissions Section === */}
      <section className="mt-6">
        <h2 className="text-xl font-semibold mb-2">Submissions</h2>

        {challenge.nominations.length === 0 ? (
          <p className="text-gray-500">No nominations submitted yet.</p>
        ) : (
          <ul className="divide-y border rounded-xl">
            {challenge.nominations.map((n) => (
              <li key={n.id} className="p-4 space-y-2">
                <p className="flex items-center gap-2">
                  <b>Submitted by:</b> {n.submitter?.firstName}{" "}
                  {n.submitter?.lastName} ({n.submitter?.email})
                  <button
                    onClick={() => setSelectedUserId(n.id)}
                    className="text-blue-600 text-sm underline"
                  >
                    <Spotlight size={16} />
                  </button>
                </p>

                {n.nominee && (
                  <p>
                    <b>Nominee:</b> {n.nominee.firstName} {n.nominee.lastName} (
                    {n.nominee.email})
                  </p>
                )}

                {n.reason && (
                  <p>
                    <b>Reason:</b> {n.reason}
                  </p>
                )}

                <p className="text-xs text-gray-500">
                  Submitted on {formatDateLocal(n.createdAt)}
                </p>

                {/* === Admin Actions === */}
                {n.status === "PENDING" && (
                  <div className="flex gap-2 mt-2">
                    {/* For single-winner challenges */}
                    {!challenge.allowMultipleWinners && (
                      <>
                        <button
                          onClick={() => updateStatus(n.id, "APPROVED")}
                          disabled={isPending}
                          className="bg-green-600 text-white px-3 py-1 rounded"
                        >
                          Approve (+{challenge.points} pts)
                        </button>
                        <button
                          onClick={() => updateStatus(n.id, "REJECTED")}
                          disabled={isPending}
                          className="bg-red-600 text-white px-3 py-1 rounded"
                        >
                          Reject
                        </button>
                      </>
                    )}

                    {/* For multiple-winner challenges */}
                    {challenge.allowMultipleWinners && (
                      <button
                        onClick={() => updateStatus(n.id, "WON")}
                        disabled={isPending}
                        className="bg-blue-600 text-white px-3 py-1 rounded"
                      >
                        Mark as Winner 🎉
                      </button>
                    )}
                  </div>
                )}

                {/* Show current status */}
                {n.status !== "PENDING" && (
                  <p className="font-medium mt-2">
                    Status:{" "}
                    <span
                      className={
                        n.status === "APPROVED" || n.status === "WON"
                          ? "text-green-600"
                          : n.status === "REJECTED"
                          ? "text-red-600"
                          : "text-gray-600"
                      }
                    >
                      {n.status}
                    </span>
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}

        {/* === Related Recognitions === */}
        <section className="mt-10">
          <h2 className="text-xl font-semibold mb-2">
            🏆 Winner Announcements
          </h2>
          {relatedRecognitions.length === 0 ? (
            <p className="text-gray-500">No winner announcements yet.</p>
          ) : (
            <ul className="divide-y border rounded-xl">
              {relatedRecognitions.map((r) => (
                <li key={r.id} className="p-4 space-y-2">
                  <p>{r.message}</p>
                  <p className="text-sm text-gray-600">
                    Announced on {formatDateLocal(r.createdAt)}
                  </p>
                  <Link
                    href={`/feed/appreciation/${r.id}`}
                    className="flex items-center gap-2 hover:text-blue-600"
                  >
                    <ArrowRight size={18} />
                    <span>View Annoucement</span>
                  </Link>
                  <ul className="ml-4 list-disc text-sm">
                    {r.recipients.map((rec) => (
                      <li key={rec.recipient.id}>
                        {rec.recipient.firstName} {rec.recipient.lastName} —{" "}
                        <b>{rec.points}</b> points
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* User modal */}
        {selectedUserId && (
          <UserInsightsModal
            userId={selectedUserId}
            onClose={() => setSelectedUserId(null)}
          />
        )}
      </section>
    </div>
  );
}
