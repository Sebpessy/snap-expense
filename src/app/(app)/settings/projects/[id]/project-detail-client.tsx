"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, MapPin, Trash2 } from "lucide-react";
import { formatCents, type Project, type ProjectStatus } from "@/lib/types";
import { PlaceAutocompleteInput, type PlaceSelection } from "@/components/place-autocomplete-input";
import { updateProjectAction, deleteProjectAction, changeProjectStatusAction } from "../actions";

const STATUS_OPTIONS: { value: ProjectStatus; label: string }[] = [
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
  { value: "archived", label: "Archived" },
];

export function ProjectDetailClient({
  project,
  ytdTotal,
  ytdCount,
}: {
  project: Project;
  ytdTotal: number;
  ytdCount: number;
}) {
  const router = useRouter();
  const [name, setName] = useState(project.name);
  const [clientName, setClientName] = useState(project.client_name ?? "");
  const [address, setAddress] = useState(project.formatted_address ?? "");
  const [place, setPlace] = useState<PlaceSelection | null>(
    project.place_id && project.lat != null && project.lng != null && project.formatted_address
      ? {
          place_id: project.place_id,
          lat: project.lat,
          lng: project.lng,
          formatted_address: project.formatted_address,
        }
      : null,
  );
  const [notes, setNotes] = useState(project.notes ?? "");
  const [status, setStatus] = useState<ProjectStatus>(project.status);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedHint, setSavedHint] = useState(false);

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSavedHint(false);
    const fd = new FormData();
    fd.set("name", name);
    if (clientName) fd.set("client_name", clientName);
    if (address) fd.set("formatted_address", address);
    if (place) {
      fd.set("place_id", place.place_id);
      fd.set("lat", String(place.lat));
      fd.set("lng", String(place.lng));
    }
    fd.set("status", status);
    if (notes) fd.set("notes", notes);
    const result = await updateProjectAction(project.id, fd);
    if (!result.success) {
      setError(result.error);
    } else {
      setSavedHint(true);
      router.refresh();
      setTimeout(() => setSavedHint(false), 2000);
    }
    setSaving(false);
  }

  async function handleStatusChange(next: ProjectStatus) {
    setStatus(next);
    const result = await changeProjectStatusAction(project.id, next);
    if (!result.success) {
      setError(result.error);
      setStatus(project.status); // revert
    } else {
      router.refresh();
    }
  }

  async function handleDelete() {
    if (
      !confirm(
        `Delete project "${project.name}"? Linked expenses keep their data but lose the project link.`,
      )
    ) {
      return;
    }
    const result = await deleteProjectAction(project.id);
    if (!result.success) {
      setError(result.error);
    } else {
      router.push("/settings/projects");
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <div className="mb-4 flex items-center gap-2">
        <Link
          href="/settings/projects"
          className="rounded-lg p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-gray-200 bg-white px-4 py-3">
          <div className="text-xs uppercase tracking-wider text-gray-400">YTD spend</div>
          <div className="mt-1 text-lg font-semibold text-gray-900">{formatCents(ytdTotal)}</div>
          <div className="text-xs text-gray-500">{ytdCount} expenses</div>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white px-4 py-3">
          <div className="text-xs uppercase tracking-wider text-gray-400">Status</div>
          <select
            value={status}
            onChange={(e) => handleStatusChange(e.target.value as ProjectStatus)}
            className="mt-1 w-full rounded-lg border border-gray-200 bg-white py-1 text-sm font-medium text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>
      )}
      {savedHint && (
        <div className="mb-3 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">Saved.</div>
      )}

      <form onSubmit={handleSave} className="space-y-3 rounded-2xl border border-gray-200 bg-white p-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">Name *</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">Client</label>
          <input
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
        <div>
          <label className="mb-1 block flex items-center gap-1 text-xs font-medium text-gray-500">
            <MapPin className="h-3 w-3" /> Address
          </label>
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
          {place && (
            <p className="mt-1 text-xs text-gray-400">
              Coords: {place.lat.toFixed(5)}, {place.lng.toFixed(5)}
            </p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
        <div className="flex items-center justify-between gap-2 pt-1">
          <button
            type="button"
            onClick={handleDelete}
            className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50"
          >
            <Trash2 className="h-3.5 w-3.5" /> Delete project
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
