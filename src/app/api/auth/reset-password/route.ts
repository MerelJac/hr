import { prisma } from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";
import { hash } from "bcryptjs";

export async function POST(req: NextRequest) {
  const { token, newPassword } = await req.json();

  const reset = await prisma.passwordResetToken.findUnique({ where: { token } });
  if (!reset || reset.expiresAt < new Date() || reset.used) {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
  }

  const passwordHash = await hash(newPassword, 12);
  await prisma.user.update({
    where: { id: reset.userId },
    data: { passwordHash },
  });

  await prisma.passwordResetToken.update({
    where: { id: reset.id },
    data: { used: true },
  });

  return NextResponse.json({ ok: true });
}
