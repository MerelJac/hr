import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { handleApiError } from "@/lib/handleApiError";

export async function PATCH(
  req: NextRequest,
   { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  type User = {
    id: string;
    email?: string;
    firstName?: string; 
    lastName?: string;
    role?: string;
    // add other properties as needed
  };
  const session = await getServerSession(authOptions);
  const role = (session?.user as User)?.role;
  if (role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { action, code, claimUrl } = await req.json();

  try {
    if (action === "approve") {
      await prisma.redemption.update({
        where: { id },
        data: { status: "APPROVED" },
      });
    } else if (action === "fulfill") {
      await prisma.redemption.update({
        where: { id },
        data: {
          status: "FULFILLED",
          code,
          claimUrl,
        },
      });
    } else if (action === "fail") {
      await prisma.redemption.update({
        where: { id },
        data: { status: "FAILED" },
      });
    } else if (action === "cancel") {
      await prisma.redemption.update({
        where: { id },
        data: { status: "CANCELLED" },
      });
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
      return handleApiError(e);
    }
  }