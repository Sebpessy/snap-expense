"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, MapPin, Building2, ChevronRight } from "lucide-react";
import { formatCents, type Project, type ProjectStatus } from "@/lib/types";
import { PlaceAutocompleteInput, type PlaceSelection } from "@/components/place-autocomplete-input";
import { createProjectAction } from "./actions";

type Props = {
  initialProjects: Project[];
  ytdByProject: Record<string, { total_cents: number; count: number }>;
};

const STATUS_TABS: { value: ProjectStatus; label: string }[] = [
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
  { value: "archived", label: "Archived" },
];

export function ProjectsClient({ initialProjects, ytdByProject }: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<ProjectStatus>("active");
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Create-form state
  const [name, setName] = useState("");
  const [clientName, setClientName] = useState("");
  const [address, setAddress] = useState("");
  const [place, setPlace] = useState<PlaceSelection | null>(null);

  const counts = useMemo(() => {
    const c: Record<ProjectStatus, number> = { active: 0, completed: 0, archived: 0 };
    for (const p of initialProjects) c[p.status]++;
    return c;
  }, [initialProjects]);

  const visible = useMemo(
    () => initialProjects.filter((p) => p.status === tab),
    [initialProjects, tab],
  );

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setCreating(true);
    setCreateError(null);
    const fd = new FormData();
    fd.set("name", name);
    if (clientName) fd.set("client_name", clientName);
    if (address) fd.set("formatted_address", address);
    if (place) {
      fd.set("place_id", place.place_id);
      fd.set("lat", String(place.lat));
      fd.set("lng", String(place.lng));
    }
    fd.set("status", "active");
    const result = await createProjectAction(fd);
    if (!result.success) {
      setCreateError(result.error);
    } else {
      setShowCreate(false);
      setName("");
      setClientName("");
      setAddress("");
      setPlace(null);
      router.refresh();
    }
    setCreating(false);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link
            href="/settings"
            className="rounded-lg p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
        </div>
        <button
          type="button"
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700"
        >
          <Plus className="h-3.5 w-3.5" /> New project
        </button>
      </div>
      <p className="mb-4 text-sm text-gray-500">
        Allocate receipts to specific jobs. Active projects appear in the capture picker.
      </p>

      <div className="mb-4 inline-flex rounded-xl border border-gray-200 bg-white p-0.5">
        {STATUS_TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              tab === t.value
                ? "bg-gray-900 text-white"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {t.label}
            <span
              className={`ml-1.5 ${
                tab === t.value ? "text-gray-300" : "text-gray-400"
              }`}
            >
              {counts[t.value]}
            </span>
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {visible.length === 0 && (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-4 py-8 text-center text-sm text-gray-400">
            No {tab} projects yet.
          </div>
        )}
        {visible.map((p) => {
          const ytd = ytdByProject[p.id];
          return (
            <Link
              key={p.id}
              href={`/settings/projects/${p.id}`}
              className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-4 py-3 hover:border-indigo-200 hover:bg-indigo-50/30"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 shrink-0 text-indigo-500" />
                  <span className="truncate font-semibold text-gray-900">{p.name}</span>
                  {p.client_name && (
                    <span className="truncate text-xs text-gray-400">· {p.client_name}</span>
                  )}
                </div>
                {p.formatted_address && (
                  <div className="mt-0.5 flex items-center gap-1 truncate text-xs text-gray-500">
                    <MapPin className="h-3 w-3 shrink-0" />
                    <span className="truncate">{p.formatted_address}</span>
                  </div>
                )}
                {ytd && (
                  <div className="mt-1 text-xs text-gray-500">
                    YTD: <span className="font-medium text-gray-700">{formatCents(ytd.total_cents)}</span>
                    <span className="text-gray-400"> · {ytd.count} expenses</span>
                  </div>
                )}
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-gray-400" />
            </Link>
          );
        })}
      </div>

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
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoFocus
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500">Client (optional)</label>
                <input
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500">Address</label>
                <PlaceAutocompleteInput
                  value={address}
                  onChange={(text) => {
                    setAddress(text);
                    if (place && text !== place.formatted_address) setPlace(null);
                  }}
                  onSelect={(p) => {
                    setPlace(p);
                    setAddress(p.formatted_address);
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
                  {creating ? "Adding..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
