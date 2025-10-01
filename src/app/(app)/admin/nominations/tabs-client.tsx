"use client";

import { Challenge } from "@/types/challenge";
import { useState } from "react";

function SubmissionForm({
  challenge,
  onSubmitted,
}: {
  challenge: Challenge;
  onSubmitted: () => void;
}) {
  async function submitNomination(formData: FormData) {
    const res = await fetch(`/api/challenges/${challenge.id}/submit`, {
      method: "POST",
      body: JSON.stringify({
        reason: formData.get("reason"),
        postUrl: formData.get("postUrl") || undefined,
        nomineeEmail: formData.get("nomineeEmail") || undefined,
      }),
      headers: { "Content-Type": "application/json" },
    });

    if (res.ok) {
      onSubmitted();
    } else {
      alert("Failed to submit nomination");
    }
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submitNomination(new FormData(e.currentTarget));
      }}
      className="space-y-3 border-t pt-4 mt-4"
    >
      <textarea
        name="reason"
        placeholder="Why are you submitting?"
        className="w-full border rounded px-3 py-2"
        required
      />
      {challenge.requirements?.requiresPostUrl && (
        <input
          type="url"
          name="postUrl"
          placeholder="Post URL"
          className="w-full border rounded px-3 py-2"
          required
        />
      )}
      {challenge.requirements?.requiresNominee && (
        <input
          type="email"
          name="nomineeEmail"
          placeholder="Nominee's email"
          className="w-full border rounded px-3 py-2"
          required
        />
      )}
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
      >
        Submit for Review
      </button>
    </form>
  );
}

function ChallengePanel({ challenge }: { challenge: Challenge }) {
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold">{challenge.title}</h2>
      <p className="text-gray-600">{challenge.description}</p>
      <p className="text-sm text-gray-500">
        {new Date(challenge.startDate).toLocaleDateString()} –{" "}
        {new Date(challenge.endDate).toLocaleDateString()}
      </p>
      <p className="text-sm font-medium">Worth {challenge.points} points</p>

      <h3 className="font-medium">Your Submissions</h3>
      {challenge.nominations?.length ? (
        <ul className="space-y-2">
          {challenge.nominations.map((n) => (
            <li
              key={n.id}
              className="border rounded p-2 flex justify-between items-center"
            >
              <span className="text-sm">
                {n.reason} • {n.status}
              </span>
              {n.postUrl && (
                <a
                  href={n.postUrl}
                  className="text-blue-600 underline text-xs"
                  target="_blank"
                >
                  View Post
                </a>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-gray-500">No submissions yet.</p>
      )}

      <SubmissionForm challenge={challenge} onSubmitted={() => location.reload()} />
    </section>
  );
}

export default function TabsClient({ challenges }: { challenges: Challenge[] }) {
  const [activeTab, setActiveTab] = useState<string | null>(
    challenges.length ? challenges[0].id : null
  );

  return (
    <div className="space-y-4 bg-white rounded-xl p-4">
      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto">
        {challenges.map((c) => (
          <button
            key={c.id}
            onClick={() => setActiveTab(c.id)}
            className={`px-3 py-1 rounded-lg ${
              activeTab === c.id ? "bg-black text-white" : "bg-gray-100"
            }`}
          >
            {c.title}
          </button>
        ))}
      </div>

      {/* Panels */}
      {activeTab && (
        <ChallengePanel challenge={challenges.find((c) => c.id === activeTab)!} />
      )}
    </div>
  );
}
