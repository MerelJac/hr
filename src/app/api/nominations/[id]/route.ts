import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { EOM_WINNER_POINTS } from "@/lib/nomination-constants";

export async function PATCH(req: Request, context: any) {
  const { id } = (await context.params) ?? {}; // works whether params is an object or Promise

  const session = await getServerSession(authOptions);
  interface SessionUser {
    role?: string;
    [key: string]: unknown;
  }
  const role = (session?.user as SessionUser)?.role;
  if (role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { action } = await req.json();

  try {
    const nom = await prisma.nomination.findUnique({ where: { id } });
    if (!nom) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (action === "reject" && nom.status === "PENDING") {
      await prisma.nomination.update({
        where: { id: nom.id },
        data: { status: "REJECTED" },
      });
      return NextResponse.json({ ok: true });
    }

    if (action === "win" && nom.type === "EOM") {
      if (!nom.nomineeId) {
        return NextResponse.json({ error: "Missing nominee." }, { status: 400 });
      }
      await prisma.$transaction(async (tx) => {
        await tx.nomination.update({
          where: { id: nom.id },
          data: { status: "WON" },
        });
        await tx.user.update({
          where: { id: nom.nomineeId },
          data: { pointsBalance: { increment: EOM_WINNER_POINTS } },
        });
      });
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Invalid action or state." }, { status: 400 });
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : "An unknown error occurred";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
