import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request, context: { params: { id: string } }) {
  // works whether params is {id} or Promise<{id}>
  const { id } = (await context.params) ?? {};
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
        data: { status: "CANCELED" },
      });
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : "An unknown error occurred";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
