"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { LeaderboardData, LeaderboardRow } from "@/types/leaderboard";
import { Building2, Star, Trophy } from "lucide-react";

export default function LeaderboardClient() {
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<"month" | "3months" | "all">("month");
  const [view, setView] = useState<"people" | "departments">("people");

  useEffect(() => {
    const now = new Date();
    let start: Date | null = null;
    if (range === "month") start = new Date(now.setMonth(now.getMonth() - 1));
    else if (range === "3months") start = new Date(now.setMonth(now.getMonth() - 3));
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
    <section className="space-y-5 p-6">

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* View toggle */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
          {(["people", "departments"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all
                ${view === v ? "bg-white text-indigo-600 shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
            >
              {v === "people" ? <><Trophy size={12} /> People</> : <><Building2 size={12} /> Departments</>}
            </button>
          ))}
        </div>

        {/* Range toggle */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
          {(["month", "3months", "all"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all
                ${range === r ? "bg-white text-indigo-600 shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
            >
              {r === "month" ? "This Month" : r === "3months" ? "3 Months" : "All Time"}
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {loading || !data ? (
        <div className="space-y-3">
          <div className="h-48 rounded-2xl bg-gray-100 animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {[1,2,3,4].map(i => <div key={i} className="h-52 rounded-2xl bg-gray-100 animate-pulse" />)}
          </div>
        </div>
      ) : view === "people" ? (
        <>
          {/* Podium */}
          {data.received && data.received.length > 0 && (
            <div className="rounded-2xl border border-indigo-100 bg-gradient-to-b from-indigo-50 to-white p-6">
              <div className="flex items-center gap-2 justify-center mb-6">
                <Trophy size={16} className="text-yellow-400 fill-yellow-400" />
                <p className="text-sm font-semibold text-gray-700">Top Stars</p>
              </div>
              <Podium users={data.received.slice(0, 3)} />
            </div>
          )}

          {/* Category cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <LeaderboardCard title="Most Points Received" icon="💫" rows={data.received} field="points" />
            <LeaderboardCard title="Most Points Given" icon="🎁" rows={data.given} field="points" />
            <LeaderboardCard title="Most Shoutouts Given" icon="📣" rows={data.shoutoutsGiven} field="count" />
            <LeaderboardCard title="Most Shoutouts Received" icon="🙌" rows={data.shoutoutsReceived} field="count" />
          </div>
        </>
      ) : (
        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
            <Building2 size={15} className="text-indigo-400" />
            <h2 className="text-sm font-semibold text-gray-700">Top Departments</h2>
          </div>
          {data.departments && data.departments.length > 0 ? (
            <ul className="divide-y divide-gray-100">
              {data.departments.map((dept, i) => (
                <li key={dept.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className={`w-6 text-right text-xs font-bold ${
                      i === 0 ? "text-yellow-500" : i === 1 ? "text-gray-400" : i === 2 ? "text-amber-600" : "text-gray-300"
                    }`}>
                      {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`}
                    </span>
                    <span className="text-sm font-medium text-gray-800">{dept.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-yellow-50 border border-yellow-100 rounded-lg px-2.5 py-1">
                    <Star size={11} className="fill-yellow-400 text-yellow-400" />
                    <span className="text-xs font-bold text-yellow-700">{dept.totalPoints ?? 0}</span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center gap-2 py-12 text-center">
              <Building2 size={24} className="text-gray-200" />
              <p className="text-sm text-gray-400">No department data yet.</p>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function Podium({ users }: { users: LeaderboardRow[] }) {
  const order = [users[1], users[0], users[2]].filter(Boolean);
  const heights = ["h-36", "h-44", "h-28"];
  const medals = ["🥈", "🥇", "🥉"];
  const ringColors = ["border-gray-300", "border-yellow-400", "border-amber-500"];

  return (
    <div className="flex justify-center items-end gap-4">
      {order.map((r, i) => (
        <div key={i} className="flex flex-col items-center">
          <Image
            src={r.user?.profileImage ?? "/default-profile-image.svg"}
            alt="Profile"
            width={44}
            height={44}
            className={`rounded-full border-2 object-cover w-11 h-11 mb-2 ${ringColors[i]}`}
          />
          <p className="text-xs font-semibold text-gray-700 text-center max-w-[72px] truncate">
            {r.user?.preferredName || r.user?.firstName || "User"}
          </p>
          <div className="flex items-center gap-0.5 mb-2">
            <Star size={10} className="fill-yellow-400 text-yellow-400" />
            <span className="text-xs font-bold text-gray-600">{r.points ?? r.count ?? 0}</span>
          </div>
          <div className={`flex items-end justify-center ${heights[i]} w-20 rounded-t-xl border border-b-0
            ${i === 1 ? "bg-yellow-50 border-yellow-200" : i === 0 ? "bg-gray-50 border-gray-200" : "bg-amber-50 border-amber-200"}`}>
            <span className="text-2xl mb-2">{medals[i]}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function LeaderboardCard({ title, icon, rows, field }: {
  title: string;
  icon: string;
  rows: LeaderboardRow[];
  field: "points" | "count";
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3.5 border-b border-gray-100">
        <span className="text-base leading-none">{icon}</span>
        <p className="text-xs font-semibold text-gray-600">{title}</p>
      </div>
      <ul className="divide-y divide-gray-100">
        {(rows ?? []).slice(0, 5).map((r, i) => (
          <li key={r.user?.id || i} className="flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className={`text-xs font-bold w-4 shrink-0 text-right ${
                i === 0 ? "text-yellow-500" : i === 1 ? "text-gray-400" : i === 2 ? "text-amber-500" : "text-gray-300"
              }`}>
                {i + 1}
              </span>
              <Image
                src={r.user?.profileImage ?? "/default-profile-image.svg"}
                alt="Profile"
                width={28}
                height={28}
                className="rounded-full border border-indigo-100 object-cover w-7 h-7 shrink-0"
              />
              <span className="text-xs font-medium text-gray-700 truncate">
                {r.user?.preferredName || r.user?.firstName || "Unknown"}
              </span>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Star size={10} className="fill-yellow-400 text-yellow-400" />
              <span className="text-xs font-semibold text-gray-700">{r[field] ?? 0}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}