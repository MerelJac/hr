"use client";
import { useRouter, usePathname } from "next/navigation";
import { useState, useTransition } from "react";
import Image from "next/image";
import {
  Star,
  SlidersHorizontal,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Recognition } from "@/types/recognition";

const CORE_VALUES = [
  { value: "LIGHT", label: "🙌 Be the Light" },
  { value: "RIGHT", label: "🏆 Do the Right Thing" },
  { value: "SERVICE", label: "🤝 Selfless Service" },
  { value: "PROBLEM", label: "💛 Proactive Positive Problem Solving" },
  { value: "EVOLUTION", label: "🌱 Embrace Evolution" },
];

const DATE_PRESETS = [
  { label: "Last 7 days", days: 7 },
  { label: "Last 30 days", days: 30 },
  { label: "Last 90 days", days: 90 },
];

type SimpleUser = {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  email: string;
};
type Department = { id: string; name: string };

type Filters = {
  coreValue?: string;
  recipientId?: string;
  departmentId?: string;
  from?: string;
  to?: string;
};

type Props = {
  recognitions: Recognition[];
  users: SimpleUser[];
  departments: Department[];
  filters: Filters;
  coreValueMap: Record<string, string>;
};

function getName(u: {
  firstName?: string | null;
  lastName?: string | null;
  email: string;
}) {
  return [u.firstName, u.lastName].filter(Boolean).join(" ") || u.email;
}

function daysAgo(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

export default function RecognitionsInsights({
  recognitions,
  users,
  departments,
  filters,
  coreValueMap,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Local filter state (mirrors URL)
  const [local, setLocal] = useState<Filters>(filters);

  function apply(patch: Partial<Filters>) {
    const next = { ...local, ...patch };
    // Remove empty values
    const params = new URLSearchParams();
    Object.entries(next).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
    setLocal(next);
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  function clear() {
    setLocal({});
    startTransition(() => router.push(pathname));
  }

  const activeCount = Object.values(local).filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page header */}
      <div className="bg-white border-b border-gray-100 px-6 py-5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
              <Star size={16} className="text-indigo-400" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                Admin
              </p>
              <h1 className="text-lg font-semibold text-gray-800 leading-tight">
                Recognition Insights
              </h1>
            </div>
          </div>

          <button
            onClick={() => setSidebarOpen((s) => !s)}
            className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-indigo-600 border border-gray-200 hover:border-indigo-300 bg-white rounded-xl px-3.5 py-2 transition-all"
          >
            <SlidersHorizontal size={15} />
            Filters
            {activeCount > 0 && (
              <span className="bg-indigo-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {activeCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6 flex gap-6">
        {/* Sidebar */}
        {sidebarOpen && (
          <aside className="w-72 shrink-0 space-y-4">
            {/* Clear all */}
            {activeCount > 0 && (
              <button
                onClick={clear}
                className="w-full flex items-center justify-center gap-1.5 text-xs font-semibold text-red-500 hover:text-red-600 border border-red-100 hover:border-red-200 bg-red-50 hover:bg-red-100 rounded-xl py-2 transition-all"
              >
                <X size={12} /> Clear all filters
              </button>
            )}

            {/* Core Value */}
            <FilterSection title="Core Value">
              <div className="space-y-1.5">
                {CORE_VALUES.map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() =>
                      apply({
                        coreValue:
                          local.coreValue === value ? undefined : value,
                      })
                    }
                    className={`w-full text-left text-xs px-3 py-2 rounded-xl border font-medium transition-all ${
                      local.coreValue === value
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                        : "bg-white text-gray-600 border-gray-200 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </FilterSection>

            {/* Recipient */}
            <FilterSection title="Recipient">
              <select
                value={local.recipientId ?? ""}
                onChange={(e) =>
                  apply({
                    recipientId: e.target.value || undefined,
                    departmentId: undefined,
                  })
                }
                className="w-full text-sm bg-white border border-gray-200 rounded-xl px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent"
              >
                <option value="">All people</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {getName(u)}
                  </option>
                ))}
              </select>
            </FilterSection>

            {/* Department */}
            <FilterSection title="Department / Team">
              <select
                value={local.departmentId ?? ""}
                onChange={(e) =>
                  apply({
                    departmentId: e.target.value || undefined,
                    recipientId: undefined,
                  })
                }
                className="w-full text-sm bg-white border border-gray-200 rounded-xl px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent"
              >
                <option value="">All departments</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </FilterSection>

            {/* Date range */}
            <FilterSection title="Date Range">
              <div className="space-y-2">
                {/* Presets */}
                <div className="flex flex-wrap gap-1.5">
                  {DATE_PRESETS.map(({ label, days }) => {
                    const from = daysAgo(days);
                    const active = local.from === from && !local.to;
                    return (
                      <button
                        key={days}
                        type="button"
                        onClick={() => apply({ from, to: undefined })}
                        className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-all ${
                          active
                            ? "bg-indigo-600 text-white border-indigo-600"
                            : "bg-white text-gray-600 border-gray-200 hover:border-indigo-300 hover:text-indigo-600"
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
                {/* Custom range */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">
                      From
                    </label>
                    <input
                      type="date"
                      value={local.from ?? ""}
                      onChange={(e) =>
                        apply({ from: e.target.value || undefined })
                      }
                      className="w-full text-xs bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">
                      To
                    </label>
                    <input
                      type="date"
                      value={local.to ?? ""}
                      onChange={(e) =>
                        apply({ to: e.target.value || undefined })
                      }
                      className="w-full text-xs bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    />
                  </div>
                </div>
              </div>
            </FilterSection>
          </aside>
        )}

        {/* Feed */}
        <div className="flex-1 min-w-0">
          {recognitions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <span className="text-5xl mb-4">🔍</span>
              <p className="text-gray-500 font-medium">
                No recognitions match these filters
              </p>
              {activeCount > 0 && (
                <button
                  onClick={clear}
                  className="mt-3 text-sm text-indigo-500 hover:underline"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <ul className="space-y-4">
              {recognitions.map((r) => (
                <li
                  key={r.id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
                >
                  {/* Recipients row */}
                  <div className="flex flex-wrap items-center gap-3 justify-between">
                    <div className="flex flex-wrap items-center gap-3">
                      {r.recipients.map((rr, i) => (
                        <div key={rr.id} className="flex items-center gap-2">
                          <Image
                            src={
                              rr.recipient.profileImage ??
                              "/default-profile-image.svg"
                            }
                            alt="Profile"
                            width={38}
                            height={38}
                            className="rounded-full w-9 h-9 border-2 border-indigo-200 object-cover"
                          />
                          <span className="font-semibold text-gray-800 text-sm">
                            {getName(rr.recipient)}
                          </span>
                          {i < r.recipients.length - 1 && (
                            <span className="text-gray-200">·</span>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-1.5 bg-yellow-50 border border-yellow-100 text-yellow-600 text-xs font-bold px-2.5 py-1.5 rounded-lg shrink-0">
                      <Star
                        size={11}
                        className="fill-yellow-400 text-yellow-400"
                      />
                      +{r.recipients.reduce((a, b) => a + b.points, 0)}
                    </div>
                  </div>

                  {/* Sender */}
                  <div className="flex items-center gap-2 mt-2.5">
                    <span className="text-xs text-gray-400">recognized by</span>
                    <Image
                      src={
                        r.sender.profileImage ?? "/default-profile-image.svg"
                      }
                      alt="Sender"
                      width={20}
                      height={20}
                      className="rounded-full w-5 h-5 border border-indigo-200 object-cover"
                    />
                    <span className="text-xs font-semibold text-gray-600">
                      {getName(r.sender)}
                    </span>
                  </div>

                  {/* Message */}
                  <p className="mt-3 text-sm text-gray-700 leading-relaxed">
                    {r.message}
                  </p>

                  {/* Core value badge */}
                  {r.coreValue && coreValueMap[r.coreValue] && (
                    <button
                      type="button"
                      onClick={() =>
                        apply({
                          coreValue:
                            local.coreValue === r.coreValue
                              ? undefined
                              : r.coreValue!,
                        })
                      }
                      className={`mt-3 inline-flex items-center text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
                        local.coreValue === r.coreValue
                          ? "bg-indigo-600 text-white border-indigo-600"
                          : "bg-indigo-50 text-indigo-600 border-indigo-200 hover:bg-indigo-100"
                      }`}
                      title="Click to filter by this value"
                    >
                      {coreValueMap[r.coreValue]}
                    </button>
                  )}

                  {/* GIF */}
                  {r.gifUrl && (
                    <Image
                      src={r.gifUrl}
                      alt="gif"
                      width={160}
                      height={160}
                      unoptimized
                      className="mt-3 rounded-xl max-h-48 w-auto"
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
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(true);
  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider hover:bg-gray-50 transition-colors"
      >
        {title}
        {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
      </button>
      {open && <div className="px-4 pb-4 space-y-2">{children}</div>}
    </div>
  );
}
