// src/app/api/nominations/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { EOM_SUBMIT_POINTS, monthKeyFromDate } from "@/lib/nomination-constants";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const submitterId = (session?.user as any)?.id;
  if (!submitterId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Expect JSON for both types now
  const body = await req.json().catch(() => ({} as any));
  const type = body.type as "EOM" | "LINKEDIN" | undefined;
  const nomineeId: string | undefined = body.nomineeId;
  const reason: string | undefined = body.reason;
  const caption: string | undefined = body.caption;
  const postUrl: string | undefined = body.postUrl;
  const monthKey = monthKeyFromDate();

  if (type !== "EOM" && type !== "LINKEDIN") {
    return NextResponse.json({ error: "Invalid type." }, { status: 400 });
  }

  try {
    // ---- pre-check to avoid hitting the unique constraint
    const existing = await prisma.nomination.findFirst({
      where: { submitterId, type, monthKey },
      select: { id: true },
    });
    if (existing) {
      return NextResponse.json(
        { error: "You’ve already submitted this nomination type this month." },
        { status: 409 }
      );
    }

    if (type === "EOM") {
      if (!nomineeId) {
        return NextResponse.json({ error: "Nominee required." }, { status: 400 });
      }
      const nominee = await prisma.user.findUnique({ where: { id: nomineeId } });
      if (!nominee) {
        return NextResponse.json({ error: "Nominee not found." }, { status: 400 });
      }

      await prisma.$transaction(async (tx) => {
        await tx.nomination.create({
          data: { type: "EOM", submitterId, nomineeId, reason, monthKey },
        });
        await tx.user.update({
          where: { id: submitterId },
          data: { pointsBalance: { increment: EOM_SUBMIT_POINTS } },
        });
      });

      return NextResponse.json({ ok: true });
    }

    // type === "LINKEDIN"
    if (!postUrl) {
      return NextResponse.json({ error: "LinkedIn post URL required." }, { status: 400 });
    }
    // basic validation; ensure absolute URL and likely LinkedIn domain
    let parsed: URL;
    try {
      parsed = new URL(postUrl);
    } catch {
      return NextResponse.json({ error: "Invalid URL." }, { status: 400 });
    }
    if (!/linkedin\.com$/i.test(parsed.hostname)) {
      return NextResponse.json({ error: "URL must be a LinkedIn post." }, { status: 400 });
    }

    await prisma.nomination.create({
      data: {
        type: "LINKEDIN",
        submitterId,
        postUrl,
        caption,
        status: "PENDING",
        monthKey,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    // use code string (Turbopack can break instanceof)
    if (err?.code === "P2002") {
      return NextResponse.json(
        { error: "You’ve already submitted this nomination type this month." },
        { status: 409 }
      );
    }
    console.error("Nomination POST error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
