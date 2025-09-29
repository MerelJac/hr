import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session?.user as any)?.role !== "SUPER_ADMIN") {
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
    department,
    sendEmail,
  } = await req.json();

  if (!email) {
    return NextResponse.json({ error: "Email required" }, { status: 400 });
  }

  const invite = await prisma.userInvite.upsert({
    where: { email },
    create: {
      email,
      role,
      createdById: (session.user as any).id,
      // optional fields
      firstName,
      lastName,
      preferredName,
      birthday: birthday ? new Date(birthday) : null,
      workAnniversary: workAnniversary ? new Date(workAnniversary) : null,
      department,
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
      department,
      sendEmail: sendEmail ?? true,
    },
  });

  // ⚡ If you later want to actually *send* the email, trigger it here.
  if (sendEmail) {
    // await sendInviteEmail(invite.email, { ...invite });
  }

  return NextResponse.json(invite);
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "SUPER_ADMIN") {
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
