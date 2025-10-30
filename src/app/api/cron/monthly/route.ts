import { NextResponse } from "next/server";
import { grantMonthlyPoints } from "@/scripts/grantMonthlyPoints";

export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  const expected = `Bearer ${process.env.CRON_SECRET}`;

  if (auth !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    console.error("🚀 Starting Monthly cron jobs...");
    interface CronResults {
      monthlyPoints: Awaited<ReturnType<typeof grantMonthlyPoints>>;
    }
    const results: Partial<CronResults> = {};

    // 1️⃣ Work anniversaries
    results.monthlyPoints = await grantMonthlyPoints();

    console.error("✅ Monthly cron completed successfully", results);
    return NextResponse.json({ success: true, results });
  } catch (err) {
    console.error("❌ Monthly cron failed:", err);
    return NextResponse.json({
      success: false,
      error: (err as Error).message,
    });
  }
}
