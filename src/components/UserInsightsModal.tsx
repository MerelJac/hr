"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { X, Star, Trophy, MessageSquare, Send } from "lucide-react";

type Props = {
  userId: string;
  onClose: () => void;
};

interface UserInsightsData {
  user: {
    profileImage?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    role?: string;
    department?: string;
  };
  points?: number;
  recentChallenges?: { id: string; title: string; endDate: string }[];
  recentReceived?: { message: string; senderName: string; createdAt: string };
  recentGiven?: { message: string; recipientName: string; createdAt: string };
}

function SectionHeader({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-2">
      <div className="w-6 h-6 rounded-md bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
        <Icon size={12} className="text-indigo-400" />
      </div>
      <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">{title}</p>
    </div>
  );
}

export default function UserInsightsModal({ userId, onClose }: Props) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<UserInsightsData | null>(null);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    fetch(`/api/users/insights?userId=${userId}`)
      .then((res) => res.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [userId]);

  if (!userId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col max-h-[90vh] overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-indigo-400">Insights</p>
            <h2 className="text-base font-semibold text-gray-800 leading-tight">User Overview</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-300 hover:text-gray-500 hover:bg-gray-100 transition-all"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5">
          {loading ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-gray-100 animate-pulse shrink-0" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gray-100 rounded-lg animate-pulse w-2/3" />
                  <div className="h-3 bg-gray-100 rounded-lg animate-pulse w-1/2" />
                </div>
              </div>
              {[1,2,3].map(i => (
                <div key={i} className="h-16 bg-gray-50 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-5">
              {/* Profile */}
              <div className="flex items-center gap-4">
                <Image
                  src={data?.user?.profileImage ?? "/default-profile-image.svg"}
                  alt="Profile"
                  width={56}
                  height={56}
                  className="rounded-full border-2 border-indigo-200 object-cover w-14 h-14 shrink-0"
                />
                <div className="min-w-0">
                  <p className="font-semibold text-gray-800">
                    {data?.user?.firstName} {data?.user?.lastName}
                  </p>
                  <p className="text-xs text-gray-400 truncate">{data?.user?.email}</p>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {data?.user?.role && (
                      <span className="text-xs font-medium px-2 py-0.5 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-500">
                        {data.user.role}
                      </span>
                    )}
                    {data?.user?.department && (
                      <span className="text-xs font-medium px-2 py-0.5 rounded-lg bg-gray-100 border border-gray-200 text-gray-500">
                        {data.user.department}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Points */}
              <div className="flex items-center gap-3 bg-yellow-50 border border-yellow-100 rounded-xl px-4 py-3">
                <Star size={16} className="fill-yellow-400 text-yellow-400 shrink-0" />
                <div>
                  <p className="text-xs text-yellow-600 font-medium">Points Balance</p>
                  <p className="text-xl font-bold text-yellow-700 leading-tight">{data?.points ?? 0}</p>
                </div>
              </div>

              {/* Challenge wins */}
              <div>
                <SectionHeader icon={Trophy} title="Recent Challenge Wins" />
                {Array.isArray(data?.recentChallenges) && data.recentChallenges.length > 0 ? (
                  <ul className="space-y-1.5">
                    {data.recentChallenges.map((c) => (
                      <li key={c.id} className="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-xl px-3 py-2">
                        <span className="text-xs font-medium text-gray-700">{c.title}</span>
                        <span className="text-xs text-gray-400">{new Date(c.endDate).toLocaleDateString()}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-gray-400 px-1">No recent challenge wins.</p>
                )}
              </div>

              {/* Recent received */}
              <div>
                <SectionHeader icon={MessageSquare} title="Most Recent Recognition Received" />
                {data?.recentReceived ? (
                  <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 space-y-1">
                    <p className="text-sm text-gray-700 leading-relaxed">{data.recentReceived.message}</p>
                    <p className="text-xs text-gray-400">
                      from {data.recentReceived.senderName} · {new Date(data.recentReceived.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 px-1">No recognitions received yet.</p>
                )}
              </div>

              {/* Recent given */}
              <div>
                <SectionHeader icon={Send} title="Most Recent Recognition Given" />
                {data?.recentGiven ? (
                  <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 space-y-1">
                    <p className="text-sm text-gray-700 leading-relaxed">{data.recentGiven.message}</p>
                    <p className="text-xs text-gray-400">
                      to {data.recentGiven.recipientName} · {new Date(data.recentGiven.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 px-1">No recognitions given yet.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}