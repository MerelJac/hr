import fetch from "node-fetch";

export const handler = async () => {
  // Add whichever endpoints you want to hit
  const endpoints = [
    "https://dev.d1gq2pjaahdqa3.amplifyapp.com/api/cron/daily", // DEV
    "https://callone.igniteappreciation.com/api/cron/daily", // PROD
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
};
