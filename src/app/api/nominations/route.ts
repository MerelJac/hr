import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { EOM_SUBMIT_POINTS, monthKeyFromDate } from "@/lib/nomination-constants";
import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const submitterId = (session?.user as any)?.id;
  if (!submitterId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const contentType = req.headers.get("content-type") || "";
  const isMultipart = contentType.includes("multipart/form-data");
  let type: "EOM" | "LINKEDIN";
  let nomineeId: string | undefined;
  let reason: string | undefined;
  let caption: string | undefined;
  let imageUrl: string | undefined;

  if (isMultipart) {
    const form = await req.formData();
    type = (form.get("type") as string) as any;
    nomineeId = form.get("nomineeId") as string | undefined;
    reason = form.get("reason") as string | undefined;
    caption = form.get("caption") as string | undefined;
    const file = form.get("image") as File | null;

    if (type === "LINKEDIN") {
      if (!file || file.size === 0) {
        return NextResponse.json({ error: "Image required for LinkedIn nomination." }, { status: 400 });
      }
      const buf = Buffer.from(await file.arrayBuffer());
      const ext = path.extname((file.name || "").toLowerCase()) || ".jpg";
      const name = crypto.randomBytes(16).toString("hex") + ext;
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      await fs.mkdir(uploadDir, { recursive: true });
      const dest = path.join(uploadDir, name);
      await fs.writeFile(dest, buf);
      imageUrl = `/uploads/${name}`;
    }
  } else {
    const body = await req.json();
    ({ type, nomineeId, reason, caption } = body);
  }

  if (type === "EOM") {
    if (!nomineeId) return NextResponse.json({ error: "Nominee required." }, { status: 400 });

    // verify nominee exists
    const nominee = await prisma.user.findUnique({ where: { id: nomineeId } });
    if (!nominee) return NextResponse.json({ error: "Nominee not found." }, { status: 400 });

    const nom = await prisma.$transaction(async (tx) => {
      const created = await tx.nomination.create({
        data: {
          type: "EOM",
          submitterId,
          nomineeId,
          reason,
          monthKey: monthKeyFromDate(),
        },
      });
      // award submitter immediately
      await tx.user.update({
        where: { id: submitterId },
        data: { pointsBalance: { increment: EOM_SUBMIT_POINTS } },
      });
      return created;
    });

    return NextResponse.json({ ok: true, id: nom.id });
  }

  if (type === "LINKEDIN") {
    if (!imageUrl) return NextResponse.json({ error: "Image upload failed." }, { status: 400 });
    const nom = await prisma.nomination.create({
      data: {
        type: "LINKEDIN",
        submitterId,
        imageUrl,
        caption,
        status: "PENDING",
      },
    });
    return NextResponse.json({ ok: true, id: nom.id });
  }

  return NextResponse.json({ error: "Invalid type." }, { status: 400 });
}
