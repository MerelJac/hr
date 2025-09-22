import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { EOM_WINNER_POINTS } from "@/lib/nomination-constants";

// Utility function to check for SUPER_ADMIN role
async function requireSuper() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role; // Consider defining a proper user type
  if (role !== "SUPER_ADMIN") return null;
  return session;
}

// PATCH handler for /api/nominations/[id]
export async function PATCH(
  request: NextRequest,
  context: { params: { id: string } }
): Promise<NextResponse> {
  // Check authorization
  const session = await requireSuper();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Extract the id from params
  const { id } = context.params;
  if (!id) {
    return NextResponse.json({ error: "Missing nomination ID" }, { status: 400 });
  }

  // Parse the request body
  const body = await request.json();
  const { action } = body;

  if (!action) {
    return NextResponse.json({ error: "Missing action" }, { status: 400 });
  }

  // Fetch the nomination
  const nom = await prisma.nomination.findUnique({ where: { id } });
  if (!nom) {
    return NextResponse.json({ error: "Nomination not found" }, { status: 404 });
  }

  // Handle "reject" action
  if (action === "reject" && nom.status === "PENDING") {
    await prisma.nomination.update({
      where: { id: nom.id },
      data: { status: "REJECTED" },
    });
    return NextResponse.json({ ok: true });
  }

  // Handle "win" action for EOM nomination
  if (action === "win" && nom.type === "EOM") {
    if (!nom.nomineeId) {
      return NextResponse.json({ error: "Missing nominee" }, { status: 400 });
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

  // Handle invalid actions or states
  return NextResponse.json({ error: "Invalid action or state" }, { status: 400 });
}