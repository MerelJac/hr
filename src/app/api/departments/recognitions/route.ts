import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const recipientsParam = req.nextUrl.searchParams.get("recipients");
  if (!recipientsParam) {
    return NextResponse.json({ error: "No recipient IDs provided" }, { status: 400 });
  }

  const recipientIds = recipientsParam.split(",");

  const recognitions = await prisma.recognition.findMany({
    where: {
      recipients: {
        some: {
          recipientId: { in: recipientIds },
        },
      },
    },
    include: {
      recipients: {
        include: {
          recipient: {
            select: { id: true, firstName: true, lastName: true, profileImage: true },
          },
        },
      },
      sender: {
        select: { id: true, firstName: true, lastName: true, profileImage: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(recognitions);
}
