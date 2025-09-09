import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redeemItem } from "@/lib/rewards";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;
  if (!user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { catalogId, deliverEmail, idemKey } = await req.json();

  if (!catalogId) return NextResponse.json({ error: "catalogId required" }, { status: 400 });

  try {
    const redemption = await redeemItem(user.id, catalogId, deliverEmail, idemKey);
    return NextResponse.json({ ok: true, redemption });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "Failed to redeem" }, { status: 400 });
  }
}
