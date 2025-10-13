// src/app/(app)/admin/nominations/page.tsx
// DEPRECATERD PAGE
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { monthKeyFromDate } from "@/lib/nomination-constants";
import { User } from "@/types/user";

export default async function NominationsAdminPage() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as User)?.role;
  if (role !== "SUPER_ADMIN") return <div className="p-6">Forbidden</div>;

  const currentMonthKey = monthKeyFromDate();

  const nominations = await prisma.nomination.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      submitter: { select: { email: true, firstName: true, lastName: true } },
      nominee: { select: { email: true, firstName: true, lastName: true } },
    },
    take: 200,
  });

  const isCurrent = (mk?: string | null) => mk === currentMonthKey;


  return (
    <main className="p-6 space-y-4 bg-white rounded-xl h-screen">
      <h1 className="text-2xl font-semibold">Challenges</h1>
    </main>
  );
}
