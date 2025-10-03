// app/api/debug-env/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? "SET" : "MISSING",
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || "MISSING",
  });
}
