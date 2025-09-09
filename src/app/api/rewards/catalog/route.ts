import { NextResponse } from "next/server";
import { listCatalog } from "@/lib/rewards";

export async function GET() {
  const items = await listCatalog();
  return NextResponse.json(items);
}
