import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { hash } from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { firstName, lastName, email, password } = await req.json();

    const invite = await prisma.userInvite.findUnique({ where: { email } });
    if (!invite || invite.consumedAt) {
      return NextResponse.json({ error: "No valid invite found for this email." }, { status: 403 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return NextResponse.json({ error: "Email already registered" }, { status: 400 });

    const passwordHash = await hash(password, 12);

    const user = await prisma.user.create({
      data: {
        firstName, lastName, email, passwordHash,
        role: invite.role, // 👈 role comes from invite
      },
    });

    await prisma.userInvite.update({
      where: { email },
      data: { consumedAt: new Date() },
    });

    return NextResponse.json({ success: true, userId: user.id });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "Server error" }, { status: 500 });
  }
}
