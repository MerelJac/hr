// src/app/(app)/admin/nominations/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import TabsClient from "./tabs-client";
import { monthKeyFromDate } from "@/lib/nomination-constants";

export default async function NominationsAdminPage() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
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

  const eom = nominations.filter(n => n.type === "EOM");
  const li  = nominations.filter(n => n.type === "LINKEDIN");

  const eomCurrent = eom.filter(n => isCurrent(n.monthKey));
  const eomPast    = eom.filter(n => !isCurrent(n.monthKey));
  const liCurrent  = li.filter(n => isCurrent(n.monthKey));
  const liPast     = li.filter(n => !isCurrent(n.monthKey));

  return (
    <main className="p-6 space-y-4 bg-white rounded-xl h-full">
      <h1 className="text-2xl font-semibold">Challenges</h1>
      <TabsClient
        eomCurrent={eomCurrent}
        eomPast={eomPast}
        liCurrent={liCurrent}
        liPast={liPast}
      />
    </main>
  );
}
