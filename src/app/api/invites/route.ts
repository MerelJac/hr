import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { User } from "@/types/user";
import { UserInvite } from "@prisma/client";
import { sendWelcomeEmail } from "@/lib/emailTemplates";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session?.user as User)?.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const {
    email,
    role,
    firstName,
    lastName,
    preferredName,
    birthday,
    workAnniversary,
    sendEmail,
    departmentId,
  } = await req.json();

  if (!email) {
    return NextResponse.json({ error: "Email required" }, { status: 400 });
  }

  // ✅ Normalize and lowercase email
  const normalizedEmail = email.trim().toLowerCase();

  // ✅ Optional: validate departmentId exists
  if (departmentId) {
    const deptExists = await prisma.department.findUnique({
      where: { id: departmentId },
    });
    if (!deptExists) {
      return NextResponse.json(
        { error: "Invalid department ID" },
        { status: 400 }
      );
    }
  }

  // ✅ Case-insensitive upsert
  const existingInvite = await prisma.userInvite.findFirst({
    where: { email: { equals: normalizedEmail, mode: "insensitive" } },
  });

  let invite;
  if (existingInvite) {
    invite = await prisma.userInvite.update({
      where: { id: existingInvite.id },
      data: {
        role,
        consumedAt: null,
        firstName,
        lastName,
        preferredName,
        birthday: birthday ? new Date(birthday) : null,
        workAnniversary: workAnniversary ? new Date(workAnniversary) : null,
        departmentId,
        sendEmail: sendEmail ?? true,
      },
    });
  } else {
    invite = await prisma.userInvite.create({
      data: {
        email: normalizedEmail,
        role,
        createdById: (session.user as UserInvite).id,
        firstName,
        lastName,
        preferredName,
        birthday: birthday ? new Date(birthday) : null,
        workAnniversary: workAnniversary ? new Date(workAnniversary) : null,
        departmentId,
        sendEmail: sendEmail ?? true,
      },
    });
  }

  if (sendEmail) {
    try {
      await sendWelcomeEmail(invite.email);
    } catch (err) {
      console.error("Email send failed:", err);
      return NextResponse.json(
        { error: "Failed to send welcome email" },
        { status: 500 }
      );
    }
  }

  return NextResponse.json(invite);
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if ((session?.user as User)?.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");
  if (!email) {
    return NextResponse.json({ error: "Email required" }, { status: 400 });
  }

  // ✅ Normalize and delete case-insensitively
  const normalizedEmail = email.trim().toLowerCase();
  const invite = await prisma.userInvite.findFirst({
    where: { email: { equals: normalizedEmail, mode: "insensitive" } },
  });

  if (invite) {
    await prisma.userInvite.delete({ where: { id: invite.id } });
  }

  return NextResponse.json({ ok: true });
}
