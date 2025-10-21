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

  // ✅ Optional: validate the departmentId exists
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

  const invite = await prisma.userInvite.upsert({
    where: { email },
    create: {
      email,
      role,
      createdById: (session.user as UserInvite).id,
      // optional fields
      firstName,
      lastName,
      preferredName,
      birthday: birthday ? new Date(birthday) : null,
      workAnniversary: workAnniversary ? new Date(workAnniversary) : null,
      departmentId,
      sendEmail: sendEmail ?? true,
    },
    update: {
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

  // ⚡ If you later want to actually *send* the email, trigger it here.
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

  await prisma.userInvite.delete({ where: { email } });
  return NextResponse.json({ ok: true });
}
