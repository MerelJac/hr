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
import Image from "next/image";

export default async function FeedPage() {
  const session = await getServerSession(authOptions);
  if (!session) return <div className="p-6">Please sign in.</div>;
  const me = session.user as any;

  const challenges = await prisma.nominationChallenge.findMany({
    where: {
      isActive: true,
      startDate: { lte: new Date() },
      endDate: { gte: new Date() },
    },
    orderBy: { createdAt: "desc" },
    include: {
      nominations: true,
    },
  });

  const availableChallenges = challenges.filter(c => c.nominations.length === 0);

  const recs = await prisma.recognition.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      sender: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
          profileImage: true,
        },
      },
      recipients: {
        include: {
          recipient: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
              profileImage: true,
            },
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
    where: { id: { not: me.id }, role: "EMPLOYEE" },
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
                <li
                  key={r.id}
                  className="rounded-t-lg p-4 my-4 mb-0 bg-white border-b border-black-2"
                >
                  <div className="flex flex-row justify-between items-center">
                    <span>
                      {r.recipients.map((rr, i) => (
                        <span
                          key={rr.id}
                          className="flex flex-row justify-center items-center gap-2"
                        >
                          <Image
                            src={
                              rr.recipient.profileImage ??
                              "/default-profile-image.svg"
                            }
                            alt="Profile"
                            width={80}
                            height={80}
                            className="rounded-full w-16 h-16 border-2 border-blue"
                          />
                          <b>{name(rr.recipient)}</b>
                          {i < r.recipients.length - 1 ? ", " : ""}
                        </span>
                      ))}
                    </span>
                    <span className="p-2 bg-green text-white rounded-lg">
                      + {r.recipients.reduce((a, b) => a + b.points, 0)} points
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 flex flex-row gap-2 items-center">
                    recognized by
                    <Image
                      src={
                        r.sender.profileImage ?? "/default-profile-image.svg"
                      }
                      alt="Profile"
                      width={30}
                      height={30}
                      className="rounded-full w-10 h-10 border-2 border-blue"
                    />
                    <b>{name(r.sender)}</b>
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
          <NominationModal users={simpleUsers} challenges={availableChallenges}/>
          <CoreValues />
        </div>
      </div>
    </main>
  );
}
