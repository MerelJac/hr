import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { handleApiError } from "@/lib/handleApiError";

export async function POST(req: NextRequest) {
  try {
    const { firstName, lastName, email, password } = await req.json();

    // ✅ Normalize email to lowercase for all comparisons and inserts
    const normalizedEmail = email.trim().toLowerCase();

    // Check for valid invite
    const invite = await prisma.userInvite.findFirst({
      where: { email: { equals: normalizedEmail, mode: "insensitive" } },
    });
    if (!invite || invite.consumedAt) {
      return NextResponse.json(
        { error: "No valid invite found for this email." },
        { status: 403 }
      );
    }

    // Check if email already exists
    const existing = await prisma.user.findFirst({
      where: { email: { equals: normalizedEmail, mode: "insensitive" } },
    });
    if (existing)
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      );

    const passwordHash = await hash(password, 12);

    const user = await prisma.user.create({
      data: {
        firstName: invite.firstName ?? firstName,
        lastName: invite.lastName ?? lastName,
        preferredName: invite.preferredName,
        email: normalizedEmail,
        passwordHash,
        role: invite.role, // from invite
        birthday: invite.birthday,
        workAnniversary: invite.workAnniversary,
        departmentId: invite.departmentId,
      },
    });

    await prisma.userInvite.update({
      where: { email: invite.email },
      data: { consumedAt: new Date() },
    });

    return NextResponse.json({ success: true, userId: user.id });
  } catch (e: unknown) {
    return handleApiError(e);
  }
}
