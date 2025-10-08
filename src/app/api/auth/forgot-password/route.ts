import { sendForgotPasswordEmail } from "@/lib/emailTemplates";
import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";
import { NextResponse, NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  const user = await prisma.user.findUnique({ where: { email } });

  if (user) {
    const token = randomUUID();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.passwordResetToken.create({
      data: { token, userId: user.id, expiresAt },
    });

    const resetUrl = `${process.env.APP_URL}/reset-password?token=${token}`;
    try {
      await sendForgotPasswordEmail(user.email, resetUrl);
    } catch (err) {
      console.error("❌ Error sending forgot-password email:", err);
    }
  }

  // Always respond success
  return NextResponse.json({ ok: true });
}
