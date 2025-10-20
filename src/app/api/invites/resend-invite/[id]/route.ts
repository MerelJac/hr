import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { User } from "@/types/user";
import { sendWelcomeEmail } from "@/lib/emailTemplates";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as User;

    const { id } = await params;

    if (!session || user?.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const invite = await prisma.userInvite.findUnique({
      where: { id: id },
    });

    if (!invite) {
      return NextResponse.json({ error: "Invite not found" }, { status: 404 });
    }

    if (!invite.email) {
      return NextResponse.json(
        { error: "Invite missing email" },
        { status: 400 }
      );
    }

    try {
      await sendWelcomeEmail(invite.email);
    } catch (err) {
      console.error("Email send failed:", err);
    }

    return NextResponse.json({
      ok: true,
      message: `Invite resent to ${invite.email}`,
    });
  } catch (err) {
    console.error("❌ Error resending invite:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
