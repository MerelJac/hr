import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ChallengeDetailClient from "./ChallengeDetailClient";
import { User } from "@/types/user";

export default async function ChallengeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as User)?.role;
  if (role !== "SUPER_ADMIN") return <div className="p-6">Forbidden</div>;
  const { id } = await params;
  const challenge = await prisma.nominationChallenge.findUnique({
    where: { id: id },
    include: {
      nominations: {
        include: {
          submitter: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
          nominee: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  const deleteSubmission = async (nominationId: string) => {
    const res = await fetch(`/api/nominations/${nominationId}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      const body = await res.json();
      throw new Error(body.error || "Failed to delete submission");
    }
  };

  const relatedRecognitions = await prisma.recognition.findMany({
    where: { challengeId: id },
    include: {
      recipients: {
        include: { recipient: true },
      },
    },
  });

  if (!challenge) return <div className="p-6">Challenge not found</div>;

  return (
    <main className="p-6 space-y-4 bg-white rounded-xl h-screen">
      <Link href={`/admin/challenges`}>
        <button className="text-gray-700 text-xs flex flex-row w-full items-center gap-2 mb-4">
          <ArrowLeft size={12} />
          Back to Challenges
        </button>
      </Link>
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
