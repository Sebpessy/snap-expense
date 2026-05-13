"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Plus, Power, PowerOff, Users } from "lucide-react";
import { formatCents, type Plan } from "@/lib/types";
import { createPlanAction, updatePlanAction, deletePlanAction } from "./actions";

type PlanRow = Plan & { user_count: number };

export function PlansClient({ initialPlans }: { initialPlans: PlanRow[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<PlanRow | null>(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function handleDelete(plan: PlanRow) {
    if (!confirm(`Delete plan "${plan.name}"? This cannot be undone.`)) return;
    setBusyId(plan.id);
    setError(null);
    const result = await deletePlanAction(plan.id);
    setBusyId(null);
    if (!result.success) {
      setError(result.error);
    } else {
      router.refresh();
    }
  }

  async function handleToggleActive(plan: PlanRow) {
    setBusyId(plan.id);
    setError(null);
    const fd = new FormData();
    fd.set("code", plan.code);
    fd.set("name", plan.name);
    fd.set("description", plan.description ?? "");
    fd.set("monthly_price_cents", plan.monthly_price_cents == null ? "" : String(plan.monthly_price_cents));
    fd.set("scans_per_month", plan.scans_per_month == null ? "" : String(plan.scans_per_month));
    fd.set("history_days", plan.history_days == null ? "" : String(plan.history_days));
    fd.set("sort_order", String(plan.sort_order));
    if (!plan.is_active) fd.set("is_active", "on");
    const result = await updatePlanAction(plan.id, fd);
    setBusyId(null);
    if (!result.success) {
      setError(result.error);
    } else {
      router.refresh();
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Plans</h1>
          <p className="text-sm text-gray-500">
            {initialPlans.length} total · pricing, limits, and active state
          </p>
        </div>
        <button
          onClick={() => {
            setCreating(true);
            setEditing(null);
            setError(null);
          }}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" /> New plan
        </button>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-left">
              <th className="px-4 py-3 font-semibold text-gray-600">Code</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Name</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Price</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Scans/mo</th>
              <th className="px-4 py-3 font-semibold text-gray-600">History</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Users</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Status</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Sort</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {initialPlans.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-gray-400">
                  No plans yet
                </td>
              </tr>
            ) : (
              initialPlans.map((plan) => (
                <tr key={plan.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs text-gray-700">{plan.code}</td>
                  <td className="px-4 py-3 text-gray-900">{plan.name}</td>
                  <td className="px-4 py-3 text-gray-700">
                    {plan.monthly_price_cents == null ? "—" : formatCents(plan.monthly_price_cents) + "/mo"}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {plan.scans_per_month == null ? "Unlimited" : plan.scans_per_month}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {plan.history_days == null ? "Unlimited" : `${plan.history_days}d`}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    <span className="inline-flex items-center gap-1">
                      <Users className="h-3.5 w-3.5 text-gray-400" />
                      {plan.user_count}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {plan.is_active ? (
                      <span className="inline-flex rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{plan.sort_order}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center gap-1">
                      <button
                        onClick={() => handleToggleActive(plan)}
                        disabled={busyId === plan.id || plan.code === "free"}
                        title={plan.is_active ? "Deactivate" : "Activate"}
                        className="rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-30 disabled:hover:bg-transparent"
                      >
                        {plan.is_active ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => {
                          setEditing(plan);
                          setCreating(false);
                          setError(null);
                        }}
                        disabled={busyId === plan.id}
                        title="Edit"
                        className="rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(plan)}
                        disabled={busyId === plan.id || plan.code === "free"}
                        title={plan.code === "free" ? "Cannot delete free plan" : "Delete"}
                        className="rounded p-1.5 text-red-500 hover:bg-red-50 hover:text-red-700 disabled:opacity-30 disabled:hover:bg-transparent"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {(editing || creating) && (
        <PlanForm
          plan={editing}
          onClose={() => {
            setEditing(null);
            setCreating(false);
          }}
          onSaved={() => {
            setEditing(null);
            setCreating(false);
            router.refresh();
          }}
          onError={setError}
        />
      )}
    </div>
  );
}

function PlanForm({
  plan,
  onClose,
  onSaved,
  onError,
}: {
  plan: PlanRow | null;
  onClose: () => void;
  onSaved: () => void;
  onError: (msg: string) => void;
}) {
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    onError("");
    const formData = new FormData(e.currentTarget);
    const result = plan
      ? await updatePlanAction(plan.id, formData)
      : await createPlanAction(formData);
    setSubmitting(false);
    if (!result.success) {
      onError(result.error);
    } else {
      onSaved();
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center">
      <div className="w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white p-6 shadow-xl sm:rounded-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            {plan ? `Edit ${plan.name}` : "New plan"}
          </h2>
          <button onClick={onClose} className="text-sm text-gray-400 hover:text-gray-600">
            Close
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Code" hint="lowercase, no spaces — used as the stable key">
              <input
                name="code"
                type="text"
                required
                defaultValue={plan?.code ?? ""}
                readOnly={plan?.code === "free"}
                placeholder="enterprise"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 read-only:bg-gray-50"
              />
            </Field>
            <Field label="Name">
              <input
                name="name"
                type="text"
                required
                defaultValue={plan?.name ?? ""}
                placeholder="Enterprise"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </Field>
          </div>

          <Field label="Description (optional)">
            <input
              name="description"
              type="text"
              defaultValue={plan?.description ?? ""}
              placeholder="Custom for teams of 10+"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </Field>

          <div className="grid grid-cols-3 gap-3">
            <Field label="Price (¢/mo)" hint="leave blank for free">
              <input
                name="monthly_price_cents"
                type="number"
                min={0}
                defaultValue={plan?.monthly_price_cents ?? ""}
                placeholder="1999"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </Field>
            <Field label="Scans/mo" hint="blank = unlimited">
              <input
                name="scans_per_month"
                type="number"
                min={0}
                defaultValue={plan?.scans_per_month ?? ""}
                placeholder="50"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </Field>
            <Field label="History (days)" hint="blank = unlimited">
              <input
                name="history_days"
                type="number"
                min={0}
                defaultValue={plan?.history_days ?? ""}
                placeholder="365"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Sort order" hint="lower = shown first">
              <input
                name="sort_order"
                type="number"
                defaultValue={plan?.sort_order ?? 0}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </Field>
            <label className="mt-6 flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                name="is_active"
                defaultChecked={plan?.is_active ?? true}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Active (visible to users)</span>
            </label>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? "Saving…" : plan ? "Save changes" : "Create plan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-gray-600">{label}</label>
      {children}
      {hint && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
    </div>
  );
}
