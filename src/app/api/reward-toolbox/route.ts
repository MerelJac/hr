import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET all links
export async function GET() {
  const links = await prisma.rewardToolboxLink.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(links);
}

// POST new link
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string })?.role;
  if (role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { label, url } = await req.json();
  if (!label || !url)
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const link = await prisma.rewardToolboxLink.create({
    data: { label, url },
  });

  return NextResponse.json(link);
}

// PATCH to edit a link
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string })?.role;
  if (role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id, label, url } = await req.json();
  const link = await prisma.rewardToolboxLink.update({
    where: { id },
    data: { label, url },
  });

  return NextResponse.json(link);
}
