// app/admin/recognitions/page.tsx
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { User } from "@/types/user";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import RecognitionsInsights from "./RecognitionInsights";
import { CoreValue } from "@/types/recognition";

const CORE_VALUE_MAP: Record<CoreValue, string> = {
  LIGHT: "🙌 Be the Light",
  RIGHT: "🏆 Do the Right Thing",
  SERVICE: "🤝 Selfless Service",
  PROBLEM: "💛 Proactive Positive Problem Solving",
  EVOLUTION: "🌱 Embrace Evolution",
};

// Derive the exact type from the query shape — no casting needed
const recognitionWithDetails =
  Prisma.validator<Prisma.RecognitionDefaultArgs>()({
    include: {
      sender: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          profileImage: true,
        },
      },
      recipients: {
        include: {
          recipient: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              profileImage: true,
              departmentId: true,
            },
          },
        },
      },
    },
  });

export type RecognitionWithDetails = Prisma.RecognitionGetPayload<
  typeof recognitionWithDetails
>;

export default async function RecognitionsPage({
  searchParams,
}: {
  searchParams: {
    coreValue?: string;
    recipientId?: string;
    departmentId?: string;
    from?: string;
    to?: string;
  };
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  const user = session?.user as User | null;
  const role = user?.role;
  if (role !== "SUPER_ADMIN" && role !== "ADMIN") redirect("/");

  const { coreValue, recipientId, departmentId, from, to } = searchParams;

  const where: Prisma.RecognitionWhereInput = {};

  if (coreValue) where.coreValue = coreValue as CoreValue;

  if (from || to) {
    where.createdAt = {
      ...(from ? { gte: new Date(from) } : {}),
      ...(to ? { lte: new Date(new Date(to).setHours(23, 59, 59, 999)) } : {}),
    };
  }

  if (recipientId || departmentId) {
    where.recipients = {
      some: {
        ...(recipientId ? { recipientId } : {}),
        ...(departmentId ? { recipient: { departmentId } } : {}),
      },
    };
  }

  const [recognitions, users, departments] = await Promise.all([
    prisma.recognition.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 100,
      ...recognitionWithDetails,
    }),
    prisma.user.findMany({
      where: { isActive: true },
      select: { id: true, firstName: true, lastName: true, email: true },
      orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
    }),
    prisma.department.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  const filters = { coreValue, recipientId, departmentId, from, to };

  return (
    <RecognitionsInsights
      recognitions={recognitions}
      users={users}
      departments={departments}
      filters={filters}
      coreValueMap={CORE_VALUE_MAP}
    />
  );
}
