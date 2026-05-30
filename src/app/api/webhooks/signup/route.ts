import { NextResponse, type NextRequest } from "next/server";
import { notifySignup } from "@/lib/notify";

/**
 * Signup webhook endpoint. The signup client POSTs here after auth.signUp
 * resolves successfully. We email a notification with enriched server-side
 * context.
 */
export async function POST(req: NextRequest) {
  let body: Record<string, unknown> = {};
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_body" }, { status: 400 });
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    null;
  const country = req.headers.get("x-vercel-ip-country") ?? null;
  const region = req.headers.get("x-vercel-ip-country-region") ?? null;
  const city = req.headers.get("x-vercel-ip-city") ?? null;
  const userAgent = req.headers.get("user-agent") ?? null;
  const referer = req.headers.get("referer") ?? null;

  notifySignup({
    email: body.email as string | undefined,
    userId: body.userId as string | null | undefined,
    emailConfirmationRequired: body.emailConfirmationRequired as
      | boolean
      | undefined,
    utm: body.utm as Record<string, string> | null | undefined,
    referrer: (body.referrer as string | null | undefined) ?? referer,
    ip,
    country,
    region,
    city,
    userAgent,
  });

  return NextResponse.json({ ok: true });
}
