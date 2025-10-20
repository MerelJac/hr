"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

type Recipient = {
  id: string;
  points: number;
  recipient: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    profileImage: string | null;
  };
};

type Sender = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  profileImage: string | null;
};

type Recognition = {
  id: string;
  message: string;
  gifUrl: string | null;
  createdAt: string;
  recipients: Recipient[];
  sender: Sender;
};

export default function RecognitionsForUsers({
  userIds,
}: {
  userIds: string[];
}) {
  const [recognitions, setRecognitions] = useState<Recognition[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userIds.length === 0) return;

    const fetchRecognitions = async () => {
      const res = await fetch(
        `/api/department/recognitions?recipients=${userIds.join(",")}`
      );
      if (res.ok) {
        const data = await res.json();
        setLoading(false);
        setRecognitions(data);
      }
      setLoading(false);
    };

    fetchRecognitions();
  }, [userIds]);

  if (loading) return <p>Loading recognitions...</p>;
  if (recognitions.length === 0)
    return (
      <p className="text-gray-500">No recognitions found for these users.</p>
    );

  return (
    <ul className="space-y-6">
      {recognitions.map((r) => (
        <li
          key={r.id}
          className="bg-white rounded-t-xl p-4 border border-gray-100 mb-0"
        >
          {/* Header: recipients */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {r.recipients.map((rr, i) => (
                <div key={rr.id} className="flex items-center gap-2">
                  <Image
                    src={
                      rr.recipient.profileImage ?? "/default-profile-image.svg"
                    }
                    alt="Profile"
                    width={64}
                    height={64}
                    className="rounded-full w-12 h-12 border-2 border-blue-500"
                  />
                  <b className="text-gray-900 text-sm sm:text-base">
                    {rr.recipient.firstName} {rr.recipient.lastName}
                  </b>
                  {i < r.recipients.length - 1 ? <span>,</span> : null}
                </div>
              ))}
            </div>

            <span className="text-xs sm:text-sm px-3 py-1 bg-green text-white rounded-lg font-semibold">
              +{r.recipients.reduce((a, b) => a + b.points, 0)} pts
            </span>
          </div>

          {/* Sender info */}
          <div className="text-sm text-gray-600 flex flex-wrap items-center gap-2 mt-2">
            recognized by
            <Image
              src={r.sender.profileImage ?? "/default-profile-image.svg"}
              alt="Profile"
              width={28}
              height={28}
              className="rounded-full w-8 h-8 border-2 border-blue-500"
            />
            <b>
              {r.sender.firstName} {r.sender.lastName}
            </b>
          </div>

          {/* Message */}
          <p className="mt-3 text-gray-800 text-sm sm:text-base leading-relaxed">
            {r.message}
            {r.gifUrl && (
              <Image
                width={160}
                height={160}
                src={r.gifUrl}
                alt="shoutout gif"
                className="mt-3 rounded-lg max-h-60 w-auto mx-auto"
              />
            )}
          </p>

          {/* Date */}
          <small className="text-gray-500 block mt-3">
            {new Date(r.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </small>
        </li>
      ))}
    </ul>
  );
}
