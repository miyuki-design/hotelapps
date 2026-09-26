import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";

const app = new Hono();

app.use("*", logger(console.log));

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

app.get("/make-server-37003faf/health", (c) => {
  return c.json({ status: "ok" });
});

app.post("/make-server-37003faf/smart-action", async (c) => {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  const notifyEmail = Deno.env.get("NOTIFY_EMAIL");

  let body: Record<string, unknown>;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "Invalid JSON" }, 400);
  }

  const { checkIn, checkOut, guests, plan, totalPrice } = body as {
    checkIn: string;
    checkOut: string;
    guests: number;
    plan: string;
    totalPrice: string;
  };

  // Sequential reservation number per check-in date
  const dateStr = (checkIn as string).replace(/-/g, "");
  const counterKey = `reservation_counter_${dateStr}`;
  const current: number = (await kv.get(counterKey)) ?? 0;
  const next = current + 1;
  await kv.set(counterKey, next);
  const reservationNumber = `HS-${dateStr}-${String(next).padStart(3, "0")}`;

  // Best-effort email
  let emailOk = false;
  if (apiKey && notifyEmail) {
    try {
      const resp = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          from: "onboarding@resend.dev",
          to: [notifyEmail],
          subject: `【新規予約 ${reservationNumber}】ホテルしののい`,
          html: `
            <h2 style="font-family:sans-serif;color:#11194b">新しい予約リクエストが届きました</h2>
            <table style="border-collapse:collapse;font-family:sans-serif;font-size:15px">
              <tr><td style="padding:6px 16px 6px 0;color:#888">予約番号</td><td style="padding:6px 0"><strong>${reservationNumber}</strong></td></tr>
              <tr><td style="padding:6px 16px 6px 0;color:#888">プラン</td><td style="padding:6px 0">${plan}</td></tr>
              <tr><td style="padding:6px 16px 6px 0;color:#888">チェックイン</td><td style="padding:6px 0">${checkIn}</td></tr>
              <tr><td style="padding:6px 16px 6px 0;color:#888">チェックアウト</td><td style="padding:6px 0">${checkOut}</td></tr>
              <tr><td style="padding:6px 16px 6px 0;color:#888">人数</td><td style="padding:6px 0">${guests}名</td></tr>
              <tr><td style="padding:6px 16px 6px 0;color:#888">合計</td><td style="padding:6px 0">${totalPrice}</td></tr>
            </table>
          `,
        }),
      });
      emailOk = resp.ok;
    } catch {
      // ignore — reservation proceeds regardless
    }
  }

  return c.json({ ok: true, reservationNumber, emailOk });
});

Deno.serve(app.fetch);
