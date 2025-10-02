import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";
import { NextResponse, NextRequest } from "next/server";
import { sendEmail } from "@/lib/email"; // your email util

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
    await sendEmail({
      to: user.email,
      subject: "Reset your password",
      html: `
        Click here to reset your password: ${resetUrl}
      `,
    });
  }

  // Always respond success
  return NextResponse.json({ ok: true });
}
