import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import NominationModal from "@/components/NominationModal";
import AvailablePointsCard from "@/components/AvailablePointsCard";
import AvailableRedeemPointsCard from "@/components/AvailableRedeemPointsCard";
import RecognizeFormWrapper from "@/components/RecognizeFormWrapper";
import CoreValues from "@/components/CoreValues";
import React from "react";
import { User } from "@/types/user";
import { Challenge, ChallengeRequirements } from "@/types/challenge";
import RecognitionList from "@/components/RecognitionList";

export default async function FeedPage() {
  const session = await getServerSession(authOptions);
  if (!session) return <div className="p-6">Please sign in.</div>;
  const me = session.user as User;

  const challenges = await prisma.nominationChallenge.findMany({
    where: {
      isActive: true,
      startDate: { lte: new Date() },
      endDate: { gte: new Date() },
      // ✅ exclude challenges already submitted by current user this month
      nominations: {
        none: {
          submitterId: me.id,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    include: {
      nominations: true,
    },
  });

  const availableChallenges: Challenge[] = challenges.map((c) => ({
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

  // const activeUser = await prisma.
  const users = await prisma.user.findMany({
    where: {
      NOT: [{ id: me.id }, { id: process.env.SYSTEM_ADMIN_ID }],
      isActive: true,
    },
  });

  const mobile = (
    <main className="min-h-screen">
      {/* Wrapper that switches between column on mobile and row on desktop */}
      <div className="flex flex-col lg:flex-row gap-6 justify-between max-w-7xl mx-auto">
        {/* === LEFT: Feed & Recognition === */}
        <div className="flex-1 space-y-4">
          <RecognizeFormWrapper />

          <ul className="space-y-6 mt-4">
            <RecognitionList
              recs={recs}
              users={users}
              user={me}
            />
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
        <div className="min-w-[70%] max-w-3xl">
          <RecognizeFormWrapper />
          <ul className="space-y-6 mt-4">
            <RecognitionList
              recs={recs}
              users={users}
              user={me}
            />
          </ul>
        </div>
        <div id="actionItems2" className="flex flex-col gap-4 overflow-hidden ">
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
