import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAvailablePoints } from "@/lib/recognition";
import NominationModal from "@/components/NominationModal";
import { getMyMonthlyNominationFlags } from "@/lib/nomination-status";
import RecognizeFormWrapper from "@/components/RecognizeFormWrapper";

export default async function RecognizePage() {
  const session = await getServerSession(authOptions);
  const me = session?.user as any;
  if (!me?.id) {
    return <div className="p-6">Please sign in.</div>;
  }

  const [users, available, flags] = await Promise.all([
    prisma.user.findMany({
      where: { id: { not: me.id } },
      select: { id: true, email: true, firstName: true, lastName: true },
      orderBy: { email: "asc" },
    }),
    getAvailablePoints(me.id),
    getMyMonthlyNominationFlags(me.id),
  ]);

  const simpleUsers = users.map((u) => ({
    id: u.id,
    label: [u.firstName, u.lastName].filter(Boolean).join(" ") || u.email,
  }));

  return (
    <main className="p-6 space-y-6">
      <div className="flex flex-row justify-between">
        <h1 className="text-2xl font-semibold">Send Stars</h1>
        <NominationModal
          users={simpleUsers}
          already={{ eom: flags.hasEom, linkedin: flags.hasLinkedIn }}
        />
      </div>

      <p className="text-sm text-gray-600">
        You have <b>{available}</b> stars to give!
      </p>
      <RecognizeFormWrapper />
    </main>
  );
}
