import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { ArrowLeft, Rocket } from "lucide-react";
import ChallengeDetailClient from "./ChallengeDetailClient";
import { User } from "@/types/user";

export default async function ChallengeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as User)?.role;
  if (role !== "SUPER_ADMIN") return (
    <div className="flex items-center justify-center h-64">
      <p className="text-sm text-gray-400">You don&apos;t have access to this page.</p>
    </div>
  );

  const { id } = await params;

  const challenge = await prisma.nominationChallenge.findUnique({
    where: { id },
    include: {
      nominations: {
        include: {
          submitter: { select: { id: true, firstName: true, lastName: true, email: true } },
          nominee: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  const relatedRecognitions = await prisma.recognition.findMany({
    where: { challengeId: id },
    include: { recipients: { include: { recipient: true } } },
  });

  if (!challenge) return (
    <div className="flex flex-col items-center gap-2 py-14 text-center">
      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
        <Rocket size={18} className="text-gray-300" />
      </div>
      <p className="text-sm text-gray-400">Challenge not found.</p>
    </div>
  );

  return (
    <main className="max-w-4xl mx-auto p-6 space-y-5">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/challenges"
          className="flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-indigo-600 border border-gray-200 hover:border-indigo-200 hover:bg-indigo-50 px-3 py-1.5 rounded-xl transition-all"
        >
          <ArrowLeft size={12} />
          Back to Challenges
        </Link>
      </div>

      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
          <Rocket size={16} className="text-indigo-400" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Challenge</p>
          <h1 className="text-lg font-semibold text-gray-800 leading-tight">{challenge.title}</h1>
        </div>
      </div>

      <ChallengeDetailClient
        challenge={{
          ...challenge,
          nominations: challenge.nominations.map((nomination) => ({
            ...nomination,
            reason: nomination.reason === null ? undefined : nomination.reason,
            screenshot: nomination.screenshot ?? undefined,
          })),
        }}
        relatedRecognitions={relatedRecognitions}
      />
    </main>
  );
}