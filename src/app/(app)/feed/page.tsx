import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import NominationModal from "@/components/NominationModal";
import AvailablePointsCard from "@/components/AvailablePointsCard";
import AvailableRedeemPointsCard from "@/components/AvailableRedeemPointsCard";
import CommentList from "@/components/CommentList";
import RecognizeFormWrapper from "@/components/RecognizeFormWrapper";
import CoreValues from "@/components/CoreValues";
import React from "react";

export default async function FeedPage() {
  const session = await getServerSession(authOptions);
  if (!session) return <div className="p-6">Please sign in.</div>;
  const me = session.user as any;

  const recs = await prisma.recognition.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      sender: { select: { firstName: true, lastName: true, email: true } },
      recipients: {
        include: {
          recipient: {
            select: { firstName: true, lastName: true, email: true },
          },
        },
      },
    },
  });

  function name(u: any) {
    const full = [u.firstName, u.lastName].filter(Boolean).join(" ");
    return full || u.email;
  }

  const users = await prisma.user.findMany({
    select: { id: true, firstName: true, lastName: true, email: true },
  });

  const simpleUsers = users.map((u) => ({ id: u.id, label: name(u) }));

  return (
    <main className="p-6 space-y-4">
      <div className="flex flex-row gap-4 justify-between">
        <div className="min-w-[70%]">
          <RecognizeFormWrapper />
          <ul className="space-y-4">
            {recs.map((r) => (
              <React.Fragment key={r.id}>
                <li key={r.id} className="rounded-lg p-4 my-4 bg-white">
                  <div className="flex flex-row justify-between items-center">
                    <span>
                      {r.recipients.map((rr, i) => (
                        <span key={rr.id}>
                          <b>{name(rr.recipient)}</b>
                          {i < r.recipients.length - 1 ? ", " : ""}
                        </span>
                      ))}
                    </span>
                    <span className="p-4 bg-green text-white rounded-lg">
                      + {r.recipients.reduce((a, b) => a + b.points, 0)} points
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    recognized by <b>{name(r.sender)}</b>
                  </div>
                  <p className="mt-2">{r.message}</p>
                  <small className="text-gray-500">
                    {new Date(r.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </small>
                </li>
                <CommentList
                  recognitionId={r.id}
                  users={simpleUsers}
                  currentUserId={me.id}
                  defaultRecipientId={r.recipients[0]?.id}
                />
              </React.Fragment>
            ))}
          </ul>
        </div>
        <div id="actionItems" className="flex flex-col gap-4">
          <AvailablePointsCard />
          <AvailableRedeemPointsCard />
          <NominationModal users={simpleUsers} />
          <CoreValues />
        </div>
      </div>
    </main>
  );
}
