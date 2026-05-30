/**
 * Email notifications for landing-page events.
 *
 * Set in .env.local (or Vercel project env):
 *   RESEND_API_KEY=re_xxxxx               (required — get from resend.com)
 *   NOTIFY_EMAIL_TO=sebpessy@gmail.com    (required — where alerts go)
 *   NOTIFY_EMAIL_FROM="Xpenz <notifications@xpenz.us>"
 *                                          (optional; defaults to
 *                                           "Xpenz <onboarding@resend.dev>".
 *                                           Set your own once xpenz.us is
 *                                           verified in Resend.)
 *
 * If RESEND_API_KEY or NOTIFY_EMAIL_TO is missing, notifications are
 * silently skipped — useful in dev / preview deploys.
 *
 * All sends are fire-and-forget — a slow email API call won't block the
 * user-facing flow that triggered it.
 */

import { Resend } from "resend";

const FROM =
  process.env.NOTIFY_EMAIL_FROM ?? "Xpenz <onboarding@resend.dev>";

function client(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

function fireAndForget(promise: Promise<unknown>, tag: string) {
  promise.catch((err) => {
    console.error(`[notify ${tag}] failed:`, err);
  });
}

/* ───────── Public API ──────────────────────────────────────────── */

export type VisitData = {
  path?: string | null;
  url?: string | null;
  referrer?: string | null;
  utm?: Record<string, string> | null;
  language?: string | null;
  screen?: { w: number; h: number } | null;
  ip?: string | null;
  country?: string | null;
  region?: string | null;
  city?: string | null;
  userAgent?: string | null;
};

export type SignupData = {
  email?: string | null;
  userId?: string | null;
  emailConfirmationRequired?: boolean;
  utm?: Record<string, string> | null;
  referrer?: string | null;
  ip?: string | null;
  country?: string | null;
  region?: string | null;
  city?: string | null;
  userAgent?: string | null;
};

export function notifyVisit(data: VisitData) {
  const resend = client();
  const to = process.env.NOTIFY_EMAIL_TO;
  if (!resend || !to) return;

  const where = data.city
    ? `${data.city}${data.region ? `, ${data.region}` : ""}${data.country ? `, ${data.country}` : ""}`
    : (data.country ?? "Unknown");
  const utmStr = data.utm
    ? Object.entries(data.utm)
        .map(([k, v]) => `${k}=${v}`)
        .join(" · ")
    : null;

  const subject = `👀 New Xpenz visitor — ${where}`;

  fireAndForget(
    resend.emails.send({
      from: FROM,
      to,
      subject,
      html: html({
        title: "New visitor on xpenz.us",
        rows: [
          ["When", new Date().toLocaleString("en-US", { timeZone: "UTC" }) + " UTC"],
          ["Path", data.path ?? "/"],
          ["From", where],
          ["IP", data.ip ?? "—"],
          ["Referrer", data.referrer ?? "(direct)"],
          ["UTM", utmStr ?? "(none)"],
          ["Language", data.language ?? "—"],
          [
            "Screen",
            data.screen ? `${data.screen.w} × ${data.screen.h}` : "—",
          ],
          ["User agent", data.userAgent ?? "—"],
        ],
      }),
    }),
    "visit",
  );
}

export function notifySignup(data: SignupData) {
  const resend = client();
  const to = process.env.NOTIFY_EMAIL_TO;
  if (!resend || !to) return;

  const where = data.city
    ? `${data.city}${data.region ? `, ${data.region}` : ""}${data.country ? `, ${data.country}` : ""}`
    : (data.country ?? "Unknown");
  const utmStr = data.utm
    ? Object.entries(data.utm)
        .map(([k, v]) => `${k}=${v}`)
        .join(" · ")
    : null;

  const subject = `🎉 New Xpenz signup — ${data.email ?? "user"}`;

  fireAndForget(
    resend.emails.send({
      from: FROM,
      to,
      subject,
      html: html({
        title: "🎉 Someone just signed up for Xpenz",
        accent: "#22c55e",
        rows: [
          ["Email", data.email ?? "—"],
          ["User ID", data.userId ?? "—"],
          [
            "Status",
            data.emailConfirmationRequired
              ? "📬 Email confirmation pending"
              : "✅ Signed up & logged in",
          ],
          ["When", new Date().toLocaleString("en-US", { timeZone: "UTC" }) + " UTC"],
          ["From", where],
          ["IP", data.ip ?? "—"],
          ["Referrer", data.referrer ?? "(direct)"],
          ["UTM", utmStr ?? "(none)"],
          ["User agent", data.userAgent ?? "—"],
        ],
      }),
    }),
    "signup",
  );
}

/* ───────── Email template ──────────────────────────────────────── */

function html(opts: {
  title: string;
  accent?: string;
  rows: Array<[string, string]>;
}) {
  const accent = opts.accent ?? "#2563eb";
  const rowsHtml = opts.rows
    .map(
      ([k, v]) => `
        <tr>
          <td style="padding:8px 12px;background:#f8fafc;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;width:120px;">${escape(k)}</td>
          <td style="padding:8px 12px;background:#ffffff;border-bottom:1px solid #e2e8f0;color:#0f172a;font-size:14px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;word-break:break-all;">${escape(v)}</td>
        </tr>`,
    )
    .join("");

  return `
<!doctype html>
<html><body style="margin:0;padding:24px;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table role="presentation" style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 12px rgba(15,23,42,0.08);">
    <tr><td style="background:${accent};padding:18px 24px;">
      <div style="color:#ffffff;font-size:18px;font-weight:800;">${escape(opts.title)}</div>
    </td></tr>
    <tr><td style="padding:0;">
      <table role="presentation" style="width:100%;border-collapse:collapse;">${rowsHtml}</table>
    </td></tr>
    <tr><td style="padding:14px 24px;background:#f8fafc;color:#94a3b8;font-size:11px;">
      Sent from xpenz.us · You can disable these notifications by removing
      <code>NOTIFY_EMAIL_TO</code> from the project environment.
    </td></tr>
  </table>
</body></html>`;
}

function escape(s: string): string {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
