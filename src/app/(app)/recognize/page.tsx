import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAvailablePoints } from "@/lib/recognition";
import RecognizeForm from "./recognize-form";

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

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Send Recognition</h1>
      <p className="text-sm text-gray-600">Available points (last 30 days): <b>{available}</b></p>
      <RecognizeForm users={users} available={available} />
    </main>
  );
}
