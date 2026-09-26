import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-37003faf/health", (c) => {
  return c.json({ status: "ok" });
});

app.post("/make-server-37003faf/notify-reservation", async (c) => {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  const notifyEmail = Deno.env.get("NOTIFY_EMAIL");

  if (!apiKey || !notifyEmail) {
    return c.json({ error: "Missing env vars" }, 500);
  }

  let body: Record<string, unknown>;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "Invalid JSON" }, 400);
  }

  const { plan, checkIn, checkOut, nights, guests } = body as {
    plan: string;
    checkIn: string;
    checkOut: string;
    nights: number;
    guests: number;
  };

  const resp = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      from: "onboarding@resend.dev",
      to: [notifyEmail],
      subject: "【新規予約】ホテルしののい",
      html: `
        <h2 style="font-family:sans-serif">新しい予約リクエストが届きました</h2>
        <table style="border-collapse:collapse;font-family:sans-serif;font-size:15px">
          <tr><td style="padding:6px 16px 6px 0;color:#888">プラン</td><td style="padding:6px 0"><strong>${plan}</strong></td></tr>
          <tr><td style="padding:6px 16px 6px 0;color:#888">チェックイン</td><td style="padding:6px 0">${checkIn}</td></tr>
          <tr><td style="padding:6px 16px 6px 0;color:#888">チェックアウト</td><td style="padding:6px 0">${checkOut}</td></tr>
          <tr><td style="padding:6px 16px 6px 0;color:#888">宿泊数</td><td style="padding:6px 0">${nights}泊</td></tr>
          <tr><td style="padding:6px 16px 6px 0;color:#888">人数</td><td style="padding:6px 0">${guests}名</td></tr>
        </table>
      `,
    }),
  });

  const data = await resp.json();
  if (!resp.ok) {
    return c.json({ error: data }, resp.status as 400 | 500);
  }

  return c.json({ ok: true, id: (data as { id: string }).id });
});

Deno.serve(app.fetch);
