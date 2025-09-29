import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function ChallengeDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  if (role !== "SUPER_ADMIN") return <div className="p-6">Forbidden</div>;

  const challenge = await prisma.nominationChallenge.findUnique({
    where: { id: params.id },
    include: {
      nominations: {
        include: {
          submitter: {
            select: { firstName: true, lastName: true, email: true },
          },
          nominee: { select: { firstName: true, lastName: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!challenge) return <div className="p-6">Challenge not found</div>;

  return (
    <main className="p-6 space-y-4 bg-white rounded-xl">
      <Link href={`/admin/challenges`} >
        <button className="text-gray-700 text-xs flex flex-row w-full items-center gap-2 mb-4">
          <ArrowLeft size={12} />
          Back to Challenges
        </button>
      </Link>
      <h1 className="text-2xl font-semibold">{challenge.title}</h1>
      <p>Points: {challenge.points}</p>
      <p>{challenge.description}</p>
      <p className="text-sm text-gray-600">{challenge.qualification}</p>
      <p className="text-xs text-gray-500">
        {new Date(challenge.startDate).toLocaleDateString()} –{" "}
        {new Date(challenge.endDate).toLocaleDateString()}
      </p>
      <span
        className={`px-2 py-1 rounded text-xs font-medium ${
          challenge.isActive
            ? "bg-green-100 text-green-800"
            : "bg-red-100 text-red-800"
        }`}
      >
        {challenge.isActive ? "Active" : "Inactive"}
      </span>

      <section className="mt-6">
        <h2 className="text-xl font-semibold mb-2">Submissions</h2>
        {challenge.nominations.length === 0 ? (
          <p className="text-gray-500">No nominations submitted yet.</p>
        ) : (
          <ul className="divide-y border rounded-xl">
            {challenge.nominations.map((n) => (
              <li key={n.id} className="p-4">
                <p>
                  <b>Submitted by:</b> {n.submitter?.firstName}{" "}
                  {n.submitter?.lastName} ({n.submitter?.email})
                </p>
                {n.nominee && (
                  <p>
                    <b>Nominee:</b> {n.nominee.firstName} {n.nominee.lastName} (
                    {n.nominee.email})
                  </p>
                )}
                {n.reason && (
                  <p>
                    <b>Reason:</b> {n.reason}
                  </p>
                )}
                {n.postUrl && (
                  <p>
                    <b>Post URL:</b>{" "}
                    <a
                      href={n.postUrl}
                      target="_blank"
                      className="text-blue-600 underline"
                    >
                      {n.postUrl}
                    </a>
                  </p>
                )}
                <p className="text-xs text-gray-500">
                  Submitted on {new Date(n.createdAt).toLocaleDateString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
