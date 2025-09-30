import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { compare, hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { handleApiError } from "@/lib/handleApiError";

export async function PATCH(req: Request) {
  try {
    // Ensure user is logged in
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { oldPassword, newPassword } = await req.json();

    if (!oldPassword || !newPassword) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Look up the user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verify old password
    const isValid = await compare(oldPassword, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: "Old password is incorrect" }, { status: 400 });
    }

    // Hash new password
    const newHash = await hash(newPassword, 12);

    // Update user
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newHash },
    });

    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    return handleApiError(e);
  }
}
