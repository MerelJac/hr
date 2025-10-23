// Node 18/20 has fetch built in — no import needed

export const handler = async () => {
  // Add whichever endpoints you want to hit
  const endpoints = [
    "https://dev.d1gq2pjaahdqa3.amplifyapp.com/api/cron/monthly", // DEV
    "https://callone.igniteappreciation.com/api/cron/monthly", // PROD
  ];

  for (const url of endpoints) {
    try {
      const res = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.CRON_SECRET ?? ""}`,
        },
      });
      console.log(`✅ Called ${url} → ${res.status}`);
    } catch (err) {
      console.error(`❌ Error calling ${url}:`, err);
    }
  }
    // 👇 Explicitly tell EventBridge “all good, no retry”
  return { statusCode: 200, body: "All monthly cron jobs triggered successfully" };
};
