"use client";

import { useEffect, useId, useRef, useState } from "react";

export type PlaceSelection = {
  formatted_address: string;
  place_id: string;
  lat: number;
  lng: number;
};

// Minimal types for what we touch on window.google.maps.places
type GMap = {
  maps: {
    places: {
      Autocomplete: new (
        input: HTMLInputElement,
        opts?: {
          types?: string[];
          componentRestrictions?: { country: string | string[] };
          fields?: string[];
        },
      ) => GAutocomplete;
    };
  };
};

type GPlaceResult = {
  formatted_address?: string;
  place_id?: string;
  geometry?: {
    location?: { lat: () => number; lng: () => number };
  };
};

type GAutocomplete = {
  addListener: (event: string, cb: () => void) => { remove: () => void };
  getPlace: () => GPlaceResult;
};

declare global {
  interface Window {
    google?: GMap;
    __snapExpenseGooglePlacesLoading?: Promise<void>;
  }
}

function loadGooglePlacesScript(apiKey: string): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.google?.maps?.places) return Promise.resolve();
  if (window.__snapExpenseGooglePlacesLoading) {
    return window.__snapExpenseGooglePlacesLoading;
  }
  window.__snapExpenseGooglePlacesLoading = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      "script[data-snap-expense-google-places]",
    );
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("places-load-failed")));
      return;
    }
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&libraries=places&v=weekly`;
    script.async = true;
    script.defer = true;
    script.dataset.snapExpenseGooglePlaces = "1";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("places-load-failed"));
    document.head.appendChild(script);
  });
  return window.__snapExpenseGooglePlacesLoading;
}

export function PlaceAutocompleteInput({
  value,
  onChange,
  onSelect,
  placeholder = "123 Main St, City, State",
  disabled,
  required,
  className = "",
  name,
}: {
  value: string;
  onChange: (text: string) => void;
  onSelect: (place: PlaceSelection) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  name?: string;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [enhanced, setEnhanced] = useState(false);
  const id = useId();
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;

  useEffect(() => {
    if (!apiKey) return;
    let listener: { remove: () => void } | null = null;
    let cancelled = false;

    loadGooglePlacesScript(apiKey)
      .then(() => {
        if (cancelled || !inputRef.current || !window.google?.maps?.places) return;
        const ac = new window.google.maps.places.Autocomplete(inputRef.current, {
          types: ["address"],
          componentRestrictions: { country: "us" },
          fields: ["formatted_address", "place_id", "geometry"],
        });
        listener = ac.addListener("place_changed", () => {
          const place = ac.getPlace();
          const formatted = place.formatted_address;
          const placeId = place.place_id;
          const lat = place.geometry?.location?.lat();
          const lng = place.geometry?.location?.lng();
          if (formatted && placeId && typeof lat === "number" && typeof lng === "number") {
            onChange(formatted);
            onSelect({ formatted_address: formatted, place_id: placeId, lat, lng });
          }
        });
        setEnhanced(true);
      })
      .catch(() => {
        // Silent fallback to plain text input
      });

    return () => {
      cancelled = true;
      listener?.remove();
    };
    // onChange / onSelect are intentionally not in deps — they're stable enough
    // for this use case and putting them in causes Autocomplete to re-bind.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKey]);

  return (
    <div className="relative">
      <input
        ref={inputRef}
        id={id}
        name={name}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        autoComplete="off"
        className={
          className ||
          "w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50"
        }
      />
      {!apiKey && (
        <p className="mt-1 text-xs text-gray-400">
          (Address autofill disabled — set NEXT_PUBLIC_GOOGLE_PLACES_API_KEY to enable)
        </p>
      )}
      {apiKey && !enhanced && (
        <p className="mt-1 text-xs text-gray-400">Loading address suggestions…</p>
      )}
    </div>
  );
}
