"use client";
import { useState, useEffect } from "react";

export default function LeaderboardClient() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<"month" | "3months" | "all">("month");

  useEffect(() => {
    const now = new Date();
    let start: Date | null = null;

    if (range === "month") {
      start = new Date(now.setMonth(now.getMonth() - 1));
    } else if (range === "3months") {
      start = new Date(now.setMonth(now.getMonth() - 3));
    }

    const params = new URLSearchParams();
    if (start) params.set("start", start.toISOString());
    params.set("end", new Date().toISOString());

    setLoading(true);
    fetch(`/api/leaderboard?${params.toString()}`)
      .then((res) => res.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [range]);

  if (loading) return <p>Loading...</p>;
  if (!data) return <p>No data</p>;

  return (
    <section className="space-y-6">
      {/* Filters */}
      <div className="flex gap-3">
        <button
          className={`px-3 py-1 rounded ${
            range === "month" ? "bg-blue-500 text-white" : "bg-gray-100"
          }`}
          onClick={() => setRange("month")}
        >
          Last Month
        </button>
        <button
          className={`px-3 py-1 rounded ${
            range === "3months" ? "bg-blue-500 text-white" : "bg-gray-100"
          }`}
          onClick={() => setRange("3months")}
        >
          Last 3 Months
        </button>
        <button
          className={`px-3 py-1 rounded ${
            range === "all" ? "bg-blue-500 text-white" : "bg-gray-100"
          }`}
          onClick={() => setRange("all")}
        >
          All Time
        </button>
      </div>

      {/* Leaderboards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <LeaderboardTable
          title="Most Points Received"
          rows={data.received}
          field="points"
        />
        <LeaderboardTable
          title="Most Points Given"
          rows={data.given}
          field="points"
        />
        <LeaderboardTable
          title="Most Shoutouts Given"
          rows={data.shoutoutsGiven}
          field="count"
        />
                <LeaderboardTable
          title="Most Shoutouts Received"
          rows={data.shoutoutsReceived}
          field="count"
        />
      </div>
    </section>
  );
}

function LeaderboardTable({ title, rows, field }: any) {
  return (
    <div className="border rounded-xl p-4 bg-white">
      <h2 className="text-lg font-semibold mb-3">{title}</h2>
      <ul className="space-y-2">
        {rows.map((r: any, i: number) => (
          <li
            key={r.user?.id || i}
            className="flex justify-between"
          >
            <span>
              {i + 1}. {r.user?.preferredName || r.user?.firstName || "Unknown"}
            </span>
            <span className="font-medium">
              {r[field] ?? 0}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
