"use client";

import { useCallback, useEffect, useState } from "react";
import type { Coords } from "./geo";

export type GeolocationStatus =
  | "idle"
  | "unsupported"
  | "prompting"
  | "granted"
  | "denied"
  | "error";

const CACHE_KEY = "snap-expense:geo";
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

type CachedCoords = { coords: Coords; ts: number };

function readCache(): CachedCoords | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedCoords;
    if (!parsed?.coords || typeof parsed.ts !== "number") return null;
    if (Date.now() - parsed.ts > CACHE_TTL_MS) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeCache(coords: Coords) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ coords, ts: Date.now() }),
    );
  } catch {
    // ignore
  }
}

export type UseGeolocationResult = {
  coords: Coords | null;
  status: GeolocationStatus;
  request: () => void;
};

/**
 * Wraps navigator.geolocation.getCurrentPosition with a sessionStorage
 * cache (5-minute TTL) so repeated picker opens don't re-prompt or
 * re-trigger the GPS chip.
 *
 * The browser prompt is shown once per origin — iOS Safari shows
 * "Allow While Using" exactly once and the OS remembers the decision.
 */
export function useGeolocation(autoRequest = true): UseGeolocationResult {
  const [coords, setCoords] = useState<Coords | null>(null);
  const [status, setStatus] = useState<GeolocationStatus>("idle");

  const request = useCallback(() => {
    if (typeof window === "undefined") return;
    if (!("geolocation" in navigator)) {
      setStatus("unsupported");
      return;
    }
    const cached = readCache();
    if (cached) {
      setCoords(cached.coords);
      setStatus("granted");
      return;
    }
    setStatus("prompting");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const c: Coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        writeCache(c);
        setCoords(c);
        setStatus("granted");
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) setStatus("denied");
        else setStatus("error");
      },
      {
        enableHighAccuracy: false,
        timeout: 5000,
        maximumAge: CACHE_TTL_MS,
      },
    );
  }, []);

  useEffect(() => {
    if (!autoRequest) return;
    request();
  }, [autoRequest, request]);

  return { coords, status, request };
}
