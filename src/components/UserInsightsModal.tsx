"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { X } from "lucide-react";

type Props = {
  userId: string;
  onClose: () => void;
};

export default function UserInsightsModal({ userId, onClose }: Props) {
  const [loading, setLoading] = useState(true);
  interface UserInsightsData {
    user: {
      profileImage?: string;
      firstName?: string;
      lastName?: string;
      email?: string;
      role?: string;
      department?: string
    };
    points?: number;
    recentChallenges?: {
      id: string;
      title: string;
      endDate: string;
    }[];
    recentReceived?: {
      message: string;
      senderName: string;
      createdAt: string;
    };
    recentGiven?: {
      message: string;
      recipientName: string;
      createdAt: string;
    };
  }

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
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm ">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg relative overflow-y-scroll max-h-[90vh]">
        {/* ❌ Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-black"
        >
          <X size={20} />
        </button>

        {loading ? (
          <p className="text-center">Loading insights...</p>
        ) : (
          <>
            <div className="flex items-center gap-4 mb-6">
              <Image
                src={data?.user?.profileImage ?? "/default-profile-image.svg"}
                alt="Profile"
                width={64}
                height={64}
                className="rounded-full border-2 border-blue-500"
              />
              <div>
                <h2 className="text-xl font-semibold">
                  {data?.user?.firstName} {data?.user?.lastName}
                </h2>
                <p className="text-gray-600 text-sm">{data?.user?.email}</p>
                <p className="text-gray-600 text-sm">{data?.user?.role}</p>
                 <p className="text-gray-600 text-sm">{data?.user?.department}</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* 💰 Points */}
              <div>
                <h3 className="text-lg font-semibold mb-1">Points Balance</h3>
                <p className="text-2xl font-bold text-blue-600">
                  {data?.points ?? 0} pts
                </p>
              </div>

              {/* 🏆 Challenge wins */}
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  Recent Challenge Wins
                </h3>
                {Array.isArray(data?.recentChallenges) &&
                data.recentChallenges.length > 0 ? (
                  <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                    {data.recentChallenges.map(
                      (c: { id: string; title: string; endDate: string }) => (
                        <li key={c.id}>
                          <span className="font-medium">{c.title}</span> —{" "}
                          {new Date(c.endDate).toLocaleDateString()}
                        </li>
                      )
                    )}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">
                    No recent challenge wins.
                  </p>
                )}
              </div>

              {/* 📩 Most recent received */}
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  Most Recent Recognition Received
                </h3>
                {data?.recentReceived ? (
                  <div className="bg-gray-50 p-3 rounded-lg border text-sm">
                    <p className="text-gray-800">
                      {data.recentReceived.message}
                    </p>
                    <p className="text-gray-500 text-xs mt-1">
                      from {data.recentReceived.senderName} on{" "}
                      {new Date(
                        data.recentReceived.createdAt
                      ).toLocaleDateString()}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">
                    No recognitions received yet.
                  </p>
                )}
              </div>

              {/* 📤 Most recent given */}
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  Most Recent Recognition Given
                </h3>
                {data?.recentGiven ? (
                  <div className="bg-gray-50 p-3 rounded-lg border text-sm">
                    <p className="text-gray-800">{data.recentGiven.message}</p>
                    <p className="text-gray-500 text-xs mt-1">
                      to {data.recentGiven.recipientName} on{" "}
                      {new Date(
                        data.recentGiven.createdAt
                      ).toLocaleDateString()}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">
                    No recognitions given yet.
                  </p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
