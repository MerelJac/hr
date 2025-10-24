import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { handleApiError } from "@/lib/handleApiError";
import { sendRedemptionEmail } from "@/lib/emailTemplates";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string })?.role;
  if (role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { action, code, claimUrl } = await req.json();

  try {
    let updated;

    switch (action) {
      case "approve":
        updated = await prisma.redemption.update({
          where: { id },
          data: { status: "APPROVED" },
          include: { user: true, catalog: true },
        });
        break;

      case "fulfill":
        updated = await prisma.redemption.update({
          where: { id },
          data: { status: "FULFILLED", code, claimUrl },
          include: { user: true, catalog: true },
        });
        break;

      case "fail":
        updated = await prisma.redemption.update({
          where: { id },
          data: { status: "FAILED" },
          include: { user: true, catalog: true },
        });
        break;

      case "cancel":
        updated = await prisma.redemption.update({
          where: { id },
          data: { status: "CANCELLED" },
          include: { user: true, catalog: true },
        });
        break;

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    // ✅ Correct email condition — note the `===` comparison, not assignment (=)
    if (
      (action === "approve" || action === "fulfill") &&
      updated.user?.email
    ) {
      try {
        await sendRedemptionEmail(updated.user.email);
        console.log("✅ Redemption email sent to:", updated.user.email);
      } catch (err) {
        console.error("❌ Failed to send redemption email:", err);
      }
    }

    return NextResponse.json(updated);
  } catch (e: unknown) {
    return handleApiError(e);
  }
}
