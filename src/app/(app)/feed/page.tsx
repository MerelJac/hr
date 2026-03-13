import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import NominationModal from "@/components/NominationModal";
import AvailablePointsCard from "@/components/AvailablePointsCard";
import AvailableRedeemPointsCard from "@/components/AvailableRedeemPointsCard";
import RecognizeFormWrapper from "@/components/RecognizeFormWrapper";
import CoreValues from "@/components/CoreValues";
import React, { Suspense } from "react";
import { User } from "@/types/user";
import { Challenge, ChallengeRequirements } from "@/types/challenge";
import RecognitionList from "@/components/RecognitionList";

export const revalidate = 60;

// ─── Skeleton helpers ────────────────────────────────────────────────────────

function CardSkeleton({ className = "" }: { className?: string }) {
  return <div className={`rounded-2xl bg-white/20 animate-pulse ${className}`} />;
}

function FeedSkeleton() {
  return (
    <div className="space-y-4 mt-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-2xl bg-white/20 animate-pulse h-36" />
      ))}
    </div>
  );
}

function SidebarSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <CardSkeleton className="h-28" />
      <CardSkeleton className="h-28" />
      <CardSkeleton className="h-40" />
      <CardSkeleton className="h-52" />
    </div>
  );
}

// ─── Async data components ────────────────────────────────────────────────────

async function Feed({ userId }: { userId: string }) {
  const [recs, users] = await Promise.all([
    prisma.recognition.findMany({
      orderBy: { createdAt: "desc" },
      take: 15,
      include: {
        sender: true,
        recipients: { include: { recipient: true } },
      },
    }),
    prisma.user.findMany({
      where: {
        NOT: [{ id: userId }, { id: process.env.SYSTEM_ADMIN_ID }],
        isActive: true,
      },
    }),
  ]);

  // We need me for RecognitionList — pass userId and let it find itself, or pass through session
  // Passing the full me object requires it to come from parent; we'll accept it as prop
  return <RecognitionList recs={recs} users={users} user={{ id: userId } as User} />;
}

async function Sidebar({ userId }: { userId: string }) {
  const [rawChallenges, users] = await Promise.all([
    prisma.nominationChallenge.findMany({
      where: {
        isActive: true,
        startDate: { lte: new Date() },
        endDate: { gte: new Date() },
        nominations: { none: { submitterId: userId } },
      },
      orderBy: { createdAt: "desc" },
      include: { nominations: true },
    }),
    prisma.user.findMany({
      where: {
        NOT: [{ id: userId }, { id: process.env.SYSTEM_ADMIN_ID }],
        isActive: true,
      },
    }),
  ]);

  const challenges: Challenge[] = rawChallenges.map((c) => ({
    ...c,
    requirements: c.requirements ? (c.requirements as ChallengeRequirements) : undefined,
  }));

  return (
    <>
      <AvailablePointsCard />
      <AvailableRedeemPointsCard />
      <NominationModal users={users} challenges={challenges} />
      <CoreValues />
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function FeedPage() {
  const session = await getServerSession(authOptions);
  if (!session) return <div className="p-6">Please sign in.</div>;

  const me = session.user as User;

  const sidebar = (
    <Suspense fallback={<SidebarSkeleton />}>
      <Sidebar userId={me.id} />
    </Suspense>
  );

  const feed = (
    <>
      <RecognizeFormWrapper />
      <ul className="space-y-6 mt-4">
        <Suspense fallback={<FeedSkeleton />}>
          <Feed userId={me.id} />
        </Suspense>
      </ul>
    </>
  );

  return (
    <main className="p-6 bg-gradient-to-t from-blue-500 to-indigo-500 min-h-screen">
      {/* Desktop */}
      <div className="hidden md:flex flex-row gap-4 justify-between max-w-7xl mx-auto">
        <div className="min-w-[70%] max-w-3xl">{feed}</div>
        <div className="flex flex-col gap-4 lg:w-[20rem] w-full">{sidebar}</div>
      </div>

      {/* Mobile */}
      <div className="flex md:hidden flex-col gap-6 max-w-7xl mx-auto">
        <div className="order-last">{feed}</div>
        <aside className="flex flex-col gap-4">{sidebar}</aside>
      </div>
    </main>
  );
}