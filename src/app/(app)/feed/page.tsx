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
import { User } from "@/types/user";
import { Challenge, ChallengeRequirements } from "@/types/challenge";

export default async function FeedPage() {
  const session = await getServerSession(authOptions);
  if (!session) return <div className="p-6">Please sign in.</div>;
  const me = session.user as User;

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

  const availableChallenges: Challenge[] = challenges
    .filter((c) => c.nominations.length === 0)
    .map((c) => ({
      ...c,
      requirements: c.requirements
        ? (c.requirements as ChallengeRequirements) // ✅ cast/parse
        : undefined,
    }));

  const recs = await prisma.recognition.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      sender: true,
      recipients: {
        include: {
          recipient: true,
        },
      },
    },
  });

  function name(u: User) {
    const full = [u.firstName, u.lastName].filter(Boolean).join(" ");
    return full || u.email;
  }

  const users = await prisma.user.findMany({
    where: { id: { not: me.id }, role: "EMPLOYEE", isActive: true },
  });

  const mobile = (
    <main className="min-h-screen">
      {/* Wrapper that switches between column on mobile and row on desktop */}
      <div className="flex flex-col lg:flex-row gap-6 justify-between max-w-7xl mx-auto">
        {/* === LEFT: Feed & Recognition === */}
        <div className="flex-1 space-y-4">
          <RecognizeFormWrapper />

          <ul className="space-y-6">
            {recs.map((r) => (
              <React.Fragment key={r.id}>
                <li className="bg-white rounded-t-xl p-4 border border-gray-100 mb-0">
                  {/* Header: recipient + points */}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      {r.recipients.map((rr, i) => (
                        <div key={rr.id} className="flex items-center gap-2">
                          <Image
                            src={
                              rr.recipient.profileImage ??
                              "/default-profile-image.svg"
                            }
                            alt="Profile"
                            width={64}
                            height={64}
                            className="rounded-full w-12 h-12 border-2 border-blue-500"
                          />
                          <b className="text-gray-900 text-sm sm:text-base">
                            {name(rr.recipient)}
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
                      src={
                        r.sender.profileImage ?? "/default-profile-image.svg"
                      }
                      alt="Profile"
                      width={28}
                      height={28}
                      className="rounded-full w-8 h-8 border-2 border-blue-500"
                    />
                    <b>{name(r.sender)}</b>
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

                <CommentList
                  recognitionId={r.id}
                  users={users}
                  defaultRecipientId={r.recipients[0]?.recipient?.id}
                />
              </React.Fragment>
            ))}
          </ul>
        </div>

        {/* === RIGHT: Sidebar widgets === */}
        <aside
          id="actionItems"
          className="flex flex-col gap-4 lg:w-[20rem] w-full order-first lg:order-none"
        >
          <AvailablePointsCard />
          <AvailableRedeemPointsCard />
          <NominationModal users={users} challenges={availableChallenges} />
          <CoreValues />
        </aside>
      </div>
    </main>
  );

  return (
    <main className="p-6 space-y-4 p-6 bg-gradient-to-t from-blue-500 to-indigo-500 h-full">
      <div className="hidden md:flex flex-row gap-4 justify-between">
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
                  <p className="mt-2">
                    {r.message}{" "}
                    {r.gifUrl && (
                      <Image
                        width={100}
                        height={100}
                        src={r.gifUrl}
                        alt="shoutout gif"
                        className="mt-3 rounded max-h-60"
                      />
                    )}
                  </p>

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
                  users={users}
                  defaultRecipientId={r.recipients[0]?.recipient?.id}
                />
              </React.Fragment>
            ))}
          </ul>
        </div>
        <div id="actionItems" className="flex flex-col gap-4">
          <AvailablePointsCard />
          <AvailableRedeemPointsCard />
          <NominationModal users={users} challenges={availableChallenges} />
          <CoreValues />
        </div>
      </div>
      <div className="flex md:hidden items-center justify-center">
        {/* Mobile view */}
        {mobile}
      </div>
    </main>
  );
}
