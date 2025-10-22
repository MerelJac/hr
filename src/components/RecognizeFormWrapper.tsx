import { prisma } from "@/lib/prisma";
import { getAvailablePoints } from "@/lib/recognition";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import RecognizeForm from "./RecognizeForm";
import { User } from "@/types/user";

export default async function RecognizeFormWrapper() {
  const session = await getServerSession(authOptions);
  const me = session?.user as User;
  if (!me?.id) return <div className="p-6">Please sign in.</div>;

  const [users, available, departments] = await Promise.all([
    prisma.user.findMany({
      where: { NOT: [{ id: me.id }, { id: process.env.SYSTEM_ADMIN_ID }] },
      select: { id: true, email: true, firstName: true, lastName: true },
      orderBy: { email: "asc" },
    }),

    getAvailablePoints(me.id),

    prisma.department.findMany({
      select: {
        id: true,
        name: true,
        users: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            profileImage: true,
          },
          where: {
            id: { not: process.env.SYSTEM_ADMIN_ID },
          },
        },
      },

      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <RecognizeForm
      users={users}
      departments={departments}
      available={available}
    />
  );
}
