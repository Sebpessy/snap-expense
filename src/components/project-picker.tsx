"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Building2, ChevronDown, Plus, X, ExternalLink, Search, MapPin, Navigation } from "lucide-react";
import { type Project } from "@/lib/types";
import { useGeolocation } from "@/lib/use-geolocation";
import { sortByDistance } from "@/lib/geo";
import { PlaceAutocompleteInput, type PlaceSelection } from "@/components/place-autocomplete-input";
import { createProjectAction } from "@/app/(app)/settings/projects/actions";

type Props = {
  projectId: string | null;
  onChange: (projectId: string | null) => void;
  projects: Project[];
  /** Optional ranking signal — e.g. how many days since the last expense touched each project */
  recencyByProjectId?: Record<string, number>;
  onProjectCreated?: (project: Project) => void;
  disabled?: boolean;
};

export function ProjectPicker({
  projectId,
  onChange,
  projects,
  recencyByProjectId,
  onProjectCreated,
  disabled,
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Geolocation — request only when picker opens (so we don't prompt on page load)
  const { coords, status: geoStatus, request } = useGeolocation(false);
  useEffect(() => {
    if (open) request();
  }, [open, request]);

  // Create-form state — needs to hold the selected place so we can submit lat/lng
  const [createName, setCreateName] = useState("");
  const [createAddress, setCreateAddress] = useState("");
  const [createPlace, setCreatePlace] = useState<PlaceSelection | null>(null);
  const [createClient, setCreateClient] = useState("");

  const selected = useMemo(
    () => projects.find((p) => p.id === projectId) ?? null,
    [projects, projectId],
  );

  const activeProjects = useMemo(
    () => projects.filter((p) => p.status === "active"),
    [projects],
  );

  const sorted = useMemo(() => {
    if (coords) {
      return sortByDistance(activeProjects, coords);
    }
    // Fallback: most-recently-used (lower recencyValue = used more recently)
    if (recencyByProjectId) {
      return [...activeProjects].sort((a, b) => {
        const ra = recencyByProjectId[a.id] ?? Infinity;
        const rb = recencyByProjectId[b.id] ?? Infinity;
        if (ra !== rb) return ra - rb;
        return a.name.localeCompare(b.name);
      });
    }
    return [...activeProjects].sort((a, b) => a.name.localeCompare(b.name));
  }, [activeProjects, coords, recencyByProjectId]);

  const filtered = useMemo(() => {
    if (!query) return sorted;
    const q = query.toLowerCase();
    return sorted.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.client_name?.toLowerCase().includes(q) ?? false) ||
        (p.formatted_address?.toLowerCase().includes(q) ?? false),
    );
  }, [sorted, query]);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setCreating(true);
    setCreateError(null);
    const fd = new FormData();
    fd.set("name", createName || query);
    if (createClient) fd.set("client_name", createClient);
    if (createAddress) fd.set("formatted_address", createAddress);
    if (createPlace) {
      fd.set("place_id", createPlace.place_id);
      fd.set("lat", String(createPlace.lat));
      fd.set("lng", String(createPlace.lng));
    }
    fd.set("status", "active");
    const result = await createProjectAction(fd);
    if (result.success && result.id) {
      const fresh: Project = {
        id: result.id,
        user_id: "",
        name: createName || query,
        client_name: createClient || null,
        formatted_address: createAddress || null,
        place_id: createPlace?.place_id ?? null,
        lat: createPlace?.lat ?? null,
        lng: createPlace?.lng ?? null,
        notes: null,
        status: "active",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      onProjectCreated?.(fresh);
      onChange(result.id);
      setShowCreate(false);
      setOpen(false);
      setQuery("");
      setCreateName("");
      setCreateAddress("");
      setCreatePlace(null);
      setCreateClient("");
    } else {
      setCreateError(result.error ?? "Failed to create project");
    }
    setCreating(false);
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <label className="block text-xs font-medium text-gray-500">Project</label>
        {selected && (
          <Link
            href={`/settings/projects/${selected.id}`}
            target="_blank"
            className="inline-flex items-center gap-0.5 text-xs text-gray-400 hover:text-gray-600"
          >
            View project <ExternalLink className="h-3 w-3" />
          </Link>
        )}
      </div>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={disabled}
        className="mt-1 flex w-full items-center justify-between rounded-xl border border-gray-300 bg-white px-3 py-2 text-left text-sm hover:bg-gray-50 disabled:opacity-50"
      >
        {selected ? (
          <span className="flex min-w-0 items-center gap-2">
            <Building2 className="h-3.5 w-3.5 shrink-0 text-indigo-500" />
            <span className="truncate font-medium text-gray-900">{selected.name}</span>
            {selected.client_name && (
              <span className="truncate text-xs text-gray-400">· {selected.client_name}</span>
            )}
          </span>
        ) : (
          <span className="text-gray-500">— None —</span>
        )}
        <span className="flex items-center gap-2">
          {selected && (
            <span
              onClick={(e) => {
                e.stopPropagation();
                onChange(null);
              }}
              role="button"
              aria-label="Clear project"
              className="rounded p-0.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              <X className="h-3.5 w-3.5" />
            </span>
          )}
          <ChevronDown className="h-4 w-4 text-gray-400" />
        </span>
      </button>

      {open && !disabled && (
        <div className="mt-2 rounded-xl border border-gray-200 bg-white p-2 shadow-sm">
          <div className="relative mb-2">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search active projects..."
              className="w-full rounded-lg border border-gray-200 py-1.5 pl-8 pr-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              autoFocus
            />
          </div>
          {coords && (
            <p className="mb-1 flex items-center gap-1 px-1 text-[10px] uppercase tracking-wider text-gray-400">
              <Navigation className="h-2.5 w-2.5" /> sorted by distance
            </p>
          )}
          {!coords && geoStatus === "denied" && (
            <p className="mb-1 px-1 text-[10px] text-gray-400">
              Location blocked — sorted by recent use
            </p>
          )}
          <ul className="max-h-56 space-y-0.5 overflow-y-auto">
            {filtered.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(p.id);
                    setOpen(false);
                    setQuery("");
                  }}
                  className={`flex w-full flex-col items-start gap-0.5 rounded-lg px-2.5 py-2 text-left text-sm hover:bg-indigo-50 ${
                    projectId === p.id ? "bg-indigo-50 text-indigo-700" : "text-gray-700"
                  }`}
                >
                  <span className="flex w-full items-center justify-between gap-2">
                    <span className="truncate font-medium">{p.name}</span>
                    {p.client_name && (
                      <span className="shrink-0 text-xs text-gray-400">{p.client_name}</span>
                    )}
                  </span>
                  {p.formatted_address && (
                    <span className="flex items-center gap-1 truncate text-[11px] text-gray-400">
                      <MapPin className="h-2.5 w-2.5 shrink-0" /> {p.formatted_address}
                    </span>
                  )}
                </button>
              </li>
            ))}
            {filtered.length === 0 && (
              <li className="px-2.5 py-2 text-xs text-gray-400">No active projects match.</li>
            )}
          </ul>
          <button
            type="button"
            onClick={() => {
              setCreateName(query);
              setShowCreate(true);
            }}
            className="mt-1 flex w-full items-center gap-2 rounded-lg border border-dashed border-indigo-300 px-2.5 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-50"
          >
            <Plus className="h-3.5 w-3.5" />
            Add new project{query ? `: "${query}"` : ""}
          </button>
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">New project</h3>
            {createError && (
              <div className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                {createError}
              </div>
            )}
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500">Name *</label>
                <input
                  required
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  autoFocus
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500">Client (optional)</label>
                <input
                  value={createClient}
                  onChange={(e) => setCreateClient(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  placeholder="e.g. Mr. & Mrs. Smith"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500">Address</label>
                <PlaceAutocompleteInput
                  value={createAddress}
                  onChange={(text) => {
                    setCreateAddress(text);
                    // If the user starts editing the text again, drop the saved place
                    if (createPlace && text !== createPlace.formatted_address) {
                      setCreatePlace(null);
                    }
                  }}
                  onSelect={(place) => {
                    setCreatePlace(place);
                    setCreateAddress(place.formatted_address);
                  }}
                />
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  disabled={creating}
                  className="flex-1 rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
                >
                  {creating ? "Adding..." : "Add & select"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
