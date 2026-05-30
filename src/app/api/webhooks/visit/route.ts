import { NextResponse, type NextRequest } from "next/server";
import { notifyVisit } from "@/lib/notify";

/**
 * Client beacon endpoint. The landing page POSTs here on first view per
 * session. We enrich the payload with server-side context (IP, country)
 * and email a notification.
 */
export async function POST(req: NextRequest) {
  let body: Record<string, unknown> = {};
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    // empty/invalid body is fine — still fire the event
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    null;
  const country = req.headers.get("x-vercel-ip-country") ?? null;
  const region = req.headers.get("x-vercel-ip-country-region") ?? null;
  const city = req.headers.get("x-vercel-ip-city") ?? null;
  const userAgent = req.headers.get("user-agent") ?? null;

  notifyVisit({
    path: body.path as string | undefined,
    url: body.url as string | undefined,
    referrer: body.referrer as string | null | undefined,
    utm: body.utm as Record<string, string> | null | undefined,
    language: body.language as string | null | undefined,
    screen: body.screen as { w: number; h: number } | null | undefined,
    ip,
    country,
    region,
    city,
    userAgent,
  });

  return NextResponse.json({ ok: true });
}
