"use client";

import { useEffect } from "react";

const SESSION_KEY = "xpenz_visit_beacon_v1";

/**
 * Fires a one-shot beacon to /api/webhooks/visit when the landing page
 * mounts. Debounced via sessionStorage so it fires once per browser
 * session, not on every navigation back to /.
 *
 * Captures: path, referrer, UTM params, language. Server-side enriches
 * with IP/country/userAgent before forwarding to the external webhook.
 */
export function VisitBeacon() {
  useEffect(() => {
    // Already fired this session — skip.
    if (typeof window === "undefined") return;
    try {
      if (sessionStorage.getItem(SESSION_KEY)) return;
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      // private mode / disabled storage — still fire below
    }

    const url = new URL(window.location.href);
    const utm: Record<string, string> = {};
    for (const k of [
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_content",
      "utm_term",
    ]) {
      const v = url.searchParams.get(k);
      if (v) utm[k.replace(/^utm_/, "")] = v;
    }

    const payload = {
      path: url.pathname,
      url: url.href,
      referrer: document.referrer || null,
      utm: Object.keys(utm).length ? utm : null,
      language:
        typeof navigator !== "undefined"
          ? navigator.language ?? null
          : null,
      screen:
        typeof window !== "undefined"
          ? { w: window.innerWidth, h: window.innerHeight }
          : null,
    };

    // sendBeacon is the right primitive — fires even if the user
    // navigates away immediately. Falls back to fetch keepalive if not
    // supported.
    const body = JSON.stringify(payload);
    try {
      if ("sendBeacon" in navigator) {
        const blob = new Blob([body], { type: "application/json" });
        navigator.sendBeacon("/api/webhooks/visit", blob);
      } else {
        fetch("/api/webhooks/visit", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body,
          keepalive: true,
        }).catch(() => {});
      }
    } catch {
      // never throw from a beacon
    }
  }, []);

  return null;
}
