import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { EOM_WINNER_POINTS, LINKEDIN_APPROVE_POINTS } from "@/lib/nomination-constants";

async function requireSuper(req: Request) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  if (role !== "SUPER_ADMIN") return null;
  return session;
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await requireSuper(req);
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { action } = await req.json();

  const nom = await prisma.nomination.findUnique({ where: { id: params.id } });
  if (!nom) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (action === "approve" && nom.type === "LINKEDIN" && nom.status === "PENDING") {
    await prisma.$transaction(async (tx) => {
      await tx.nomination.update({ where: { id: nom.id }, data: { status: "APPROVED" } });
      await tx.user.update({
        where: { id: nom.submitterId },
        data: { pointsBalance: { increment: LINKEDIN_APPROVE_POINTS } },
      });
    });
    return NextResponse.json({ ok: true });
  }

  if (action === "reject" && nom.status === "PENDING") {
    await prisma.nomination.update({ where: { id: nom.id }, data: { status: "REJECTED" } });
    return NextResponse.json({ ok: true });
  }

  if (action === "win" && nom.type === "EOM") {
    if (!nom.nomineeId) return NextResponse.json({ error: "Missing nominee." }, { status: 400 });
    await prisma.$transaction(async (tx) => {
      await tx.nomination.update({ where: { id: nom.id }, data: { status: "WON" } });
      await tx.user.update({
        where: { id: nom.nomineeId! },
        data: { pointsBalance: { increment: EOM_WINNER_POINTS } },
      });
    });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Invalid action or state." }, { status: 400 });
}
