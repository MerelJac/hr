import { NextResponse } from "next/server";
import { grantAnniversaryPoints } from "@/scripts/grantAnniversaryPoints";
import { grantBirthdayPoints } from "@/scripts/grantBirthdayPoints";

export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  const expected = `Bearer ${process.env.CRON_SECRET}`;

  if (auth !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    console.log("🚀 Starting daily cron jobs...");
    interface CronResults {
      anniversaries: Awaited<ReturnType<typeof grantAnniversaryPoints>>;
      birthdays: Awaited<ReturnType<typeof grantBirthdayPoints>>;
    }
    const results: Partial<CronResults> = {};

    // 1️⃣ Work anniversaries
    results.anniversaries = await grantAnniversaryPoints();

    // 2️⃣ Birthdays
    results.birthdays = await grantBirthdayPoints();

    console.log("✅ Daily cron completed successfully", results);
    return NextResponse.json({ success: true, results });
  } catch (err) {
    console.error("❌ Daily cron failed:", err);
    return NextResponse.json({
      success: false,
      error: (err as Error).message,
    });
  }
}
