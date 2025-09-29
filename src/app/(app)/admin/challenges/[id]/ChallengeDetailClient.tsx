"use client";

import { useTransition } from "react";

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
    nominations: {
      id: string;
      status: string;
      reason?: string | null;
      createdAt: string | Date;
      submitter?: { firstName?: string | null; lastName?: string | null; email?: string | null } | null;
      nominee?: { firstName?: string | null; lastName?: string | null; email?: string | null } | null;
    }[];
  };
};

export default function ChallengeDetailClient({ challenge }: ChallengeDetailProps) {
  const [isPending, startTransition] = useTransition();

  async function updateStatus(id: string, status: "APPROVED" | "REJECTED") {
    const res = await fetch(`/api/nominations/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    if (!res.ok) {
      alert("Failed to update status");
    } else {
      startTransition(() => {
        // reload page after update
        window.location.reload();
      });
    }
  }

  return (
    <>
      <h1 className="text-2xl font-semibold">{challenge.title}</h1>
      <p>Points: {challenge.points}</p>
      <p>{challenge.description}</p>
      <p className="text-sm text-gray-600">{challenge.qualification}</p>
      <p className="text-xs text-gray-500">
        {new Date(challenge.startDate).toLocaleDateString()} –{" "}
        {new Date(challenge.endDate).toLocaleDateString()}
      </p>
      <span
        className={`px-2 py-1 rounded text-xs font-medium ${
          challenge.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
        }`}
      >
        {challenge.isActive ? "Active" : "Inactive"}
      </span>

      <section className="mt-6">
        <h2 className="text-xl font-semibold mb-2">Submissions</h2>
        {challenge.nominations.length === 0 ? (
          <p className="text-gray-500">No nominations submitted yet.</p>
        ) : (
          <ul className="divide-y border rounded-xl">
            {challenge.nominations.map((n) => (
              <li key={n.id} className="p-4 space-y-2">
                <p>
                  <b>Submitted by:</b> {n.submitter?.firstName} {n.submitter?.lastName} ({n.submitter?.email})
                </p>
                {n.nominee && (
                  <p>
                    <b>Nominee:</b> {n.nominee.firstName} {n.nominee.lastName} ({n.nominee.email})
                  </p>
                )}
                {n.reason && (
                  <p>
                    <b>Reason:</b> {n.reason}
                  </p>
                )}
                <p><b>Status:</b> {n.status}</p>
                <p className="text-xs text-gray-500">
                  Submitted on {new Date(n.createdAt).toLocaleDateString()}
                </p>

                {n.status === "PENDING" && (
                  <div className="flex gap-2 mt-2">
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
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
