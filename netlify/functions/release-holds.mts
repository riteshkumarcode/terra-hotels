import type { Config } from "@netlify/functions";

export default async () => {
  const siteUrl = process.env.URL || "http://localhost:3000";
  try {
    const res = await fetch(`${siteUrl}/api/cron/release-holds`, {
      method: "POST",
    });
    console.log(`[NETLIFY SCHEDULED FUNCTION] Hold reaper executed: status ${res.status}`);
  } catch (err) {
    console.error("[NETLIFY SCHEDULED FUNCTION ERROR]", err);
  }
};

export const config: Config = {
  schedule: "*/5 * * * *",
};
