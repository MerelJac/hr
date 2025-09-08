import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAvailablePoints } from "@/lib/recognition";
import RecognizeForm from "./recognize-form";
import NominationModal from "@/components/NominationModal";
export default async function RecognizePage() {
  const session = await getServerSession(authOptions);
  const me = session?.user as any;
  if (!me?.id) {
    return <div className="p-6">Please sign in.</div>;
  }

  const [users, available] = await Promise.all([
    prisma.user.findMany({
      where: { id: { not: me.id } },
      select: { id: true, email: true, firstName: true, lastName: true },
      orderBy: { email: "asc" },
    }),
    getAvailablePoints(me.id),
  ]);

  const simpleUsers = users.map((u) => ({
    id: u.id,
    label: [u.firstName, u.lastName].filter(Boolean).join(" ") || u.email,
  }));
  const isSuperAdmin = me.role === "SUPER_ADMIN";

  return (
    <main className="p-6 space-y-6">
      <div className="flex flex-row justify-between">
        <h1 className="text-2xl font-semibold">Send Recognition</h1>
        <NominationModal users={simpleUsers} isSuperAdmin={isSuperAdmin} />
      </div>

      <p className="text-sm text-gray-600">
        Available points (last 30 days): <b>{available}</b>
      </p>
      <RecognizeForm users={users} available={available} />
    </main>
  );
}
