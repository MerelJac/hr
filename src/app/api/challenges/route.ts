import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { User } from "@/types/user";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if ((session?.user as User)?.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const challenge = await prisma.nominationChallenge.create({
    data: {
      title: body.title,
      description: body.description,
      qualification: body.qualification,
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
      isActive: body.isActive ?? true,
      points: body.points ?? 0,
      gifUrl: body.gifUrl ?? null,
      requirements: body.requirements ?? {},
    },
  });

  return NextResponse.json(challenge);
}
