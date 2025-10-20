"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { LeaderboardData, LeaderboardRow } from "@/types/leaderboard";

export default function LeaderboardClient() {
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<"month" | "3months" | "all">("month");
  const [view, setView] = useState<"people" | "departments">("people"); // 👈 new toggle

  useEffect(() => {
    const now = new Date();
    let start: Date | null = null;
    if (range === "month") start = new Date(now.setMonth(now.getMonth() - 1));
    else if (range === "3months")
      start = new Date(now.setMonth(now.getMonth() - 3));

    const params = new URLSearchParams();
    if (start) params.set("start", start.toISOString());
    params.set("end", new Date().toISOString());
    params.set("type", view);
    setLoading(true);
    fetch(`/api/leaderboard?${params.toString()}`)
      .then((res) => res.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [range, view]);

  return (
    <section className="space-y-8 p-6 h-screen">
      {/* View Selector */}
      <div className="flex justify-center gap-3 mb-4">
        {["people", "departments"].map((v) => (
          <button
            key={v}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              view === v
                ? "bg-blue-600 text-white shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
            onClick={() => setView(v as typeof view)}
          >
            {v === "people" ? "People" : "Departments"}
          </button>
        ))}
      </div>
      {/* Range Selector */}
      <div className="flex justify-center gap-3">
        {["month", "3months", "all"].map((r) => (
          <button
            key={r}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              range === r
                ? "bg-blue-600 text-white shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
            onClick={() => setRange(r as typeof range)}
          >
            {r === "month"
              ? "Last Month"
              : r === "3months"
              ? "Last 3 Months"
              : "All Time"}
          </button>
        ))}
      </div>

      {/* Leaderboards */}
      {loading || !data ? (
        <div className="flex justify-center py-10 text-gray-500 text-sm">
          Loading leaderboard...
        </div>
      ) : view === "people" ? (
        <>
          {/* 🏆 Podium */}
          {/* 🏆 Podium */}
          {view === "people" && data.received ? (
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-2xl shadow-inner">
              <h2 className="text-xl font-semibold text-center mb-6 text-blue-800">
                🏆 Top Stars
              </h2>
              <Podium users={data.received.slice(0, 3)} />
            </div>
          ) : null}

          {/* 🧩 Individual Categories */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            <LeaderboardCard
              title="Most Points Received"
              icon="💫"
              rows={data.received}
              field="points"
            />
            <LeaderboardCard
              title="Most Points Given"
              icon="🎁"
              rows={data.given}
              field="points"
            />
            <LeaderboardCard
              title="Most Shoutouts Given"
              icon="📣"
              rows={data.shoutoutsGiven}
              field="count"
            />
            <LeaderboardCard
              title="Most Shoutouts Received"
              icon="🙌"
              rows={data.shoutoutsReceived}
              field="count"
            />
          </div>
        </>
      ) : (
        <>
          {/* 🏢 Department Leaderboard */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <h2 className="text-xl font-semibold text-blue-700 mb-4 flex items-center gap-2">
              🏢 Top Departments
            </h2>
            <ul className="divide-y divide-gray-100">
              {data.departments?.map((dept, i) => (
                <li
                  key={dept.id}
                  className="flex justify-between items-center py-3 text-sm"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 w-5 text-right">
                      {i + 1}.
                    </span>
                    <span className="font-medium text-gray-800">
                      {dept.name}
                    </span>
                  </div>
                  <span className="font-semibold text-blue-600">
                    {dept.totalPoints ?? 0} ⭐
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </section>
  );
}

/* 🏆 Podium Layout for Top 3 */
function Podium({ users }: { users: LeaderboardRow[] }) {
  const podium = [
    users[1], // second place
    users[0], // first place
    users[2], // third place
  ].filter(Boolean);

  const heights = ["h-32", "h-40", "h-24"]; // visual height difference
  return (
    <div className="flex justify-center items-end gap-6">
      {podium.map((r, i) => (
        <div key={i} className="flex flex-col items-center">
          <div
            className={`flex flex-col items-center justify-end bg-blue-${
              i === 1 ? "500" : "400"
            } text-white rounded-t-xl ${heights[i]} w-20 md:w-24 shadow-lg`}
          >
            <Image
              src={r.user?.profileImage ?? "/default-profile-image.svg"}
              alt="Profile"
              width={48}
              height={48}
              className="rounded-full border-2 border-white -mt-10"
            />
            <span className="text-xs mt-2 font-medium">
              {r.user?.preferredName || r.user?.firstName || "User"}
            </span>
            <span className="text-xs opacity-90 mb-2">
              {r.points ?? r.count ?? 0}⭐
            </span>
          </div>
          <div
            className={`${
              i === 1
                ? "text-yellow-500 text-xl mt-1"
                : "text-gray-400 text-lg mt-1"
            }`}
          >
            {i === 1 ? "🥇" : i === 0 ? "🥈" : "🥉"}
          </div>
        </div>
      ))}
    </div>
  );
}

/* 🧾 Card-style subleaderboards */
function LeaderboardCard({
  title,
  icon,
  rows,
  field,
}: {
  title: string;
  icon: string;
  rows: LeaderboardRow[];
  field: "points" | "count";
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition p-5 border border-gray-100">
      <h3 className="text-base font-semibold mb-3 flex items-center gap-2 text-blue-700">
        <span className="text-lg">{icon}</span>
        {title}
      </h3>
      <ul className="divide-y divide-gray-100">
        {(rows ?? []).slice(0, 5).map((r, i) => (
          <li
            key={r.user?.id || i}
            className="flex justify-between items-center py-2 text-sm"
          >
            <span className="flex items-center gap-2">
              <span className="text-gray-400 w-5 text-right">{i + 1}.</span>
              <Image
                src={r.user?.profileImage ?? "/default-profile-image.svg"}
                alt="Profile"
                width={32}
                height={32}
                className="rounded-full border border-blue-200"
              />
              <span className="truncate">
                {r.user?.preferredName || r.user?.firstName || "Unknown"}
              </span>
            </span>
            <span className="font-semibold text-blue-600">{r[field] ?? 0}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
