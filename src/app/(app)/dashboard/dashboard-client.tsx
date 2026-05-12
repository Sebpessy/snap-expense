"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Chart } from "@/components/ui/chart";
import { getCategory } from "@/lib/categories";
import { formatCents } from "@/lib/types";

type YtdRow = {
  amount_cents: number | null;
  expense_date: string | null;
  category_code: string | null;
  is_business: boolean;
  merchant: string | null;
  sub_id: string | null;
};
type TrendRow = {
  amount_cents: number | null;
  expense_date: string | null;
  is_business: boolean;
};

type Props = {
  ytd: YtdRow[];
  trend: TrendRow[];
};

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function DashboardClient({ ytd, trend }: Props) {
  const now = useMemo(() => new Date(), []);
  const monthStart = useMemo(
    () => new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0],
    [now],
  );

  // Totals
  const ytdBusiness = ytd
    .filter((e) => e.is_business && e.amount_cents != null)
    .reduce((s, e) => s + (e.amount_cents ?? 0), 0);
  const ytdPersonal = ytd
    .filter((e) => !e.is_business && e.amount_cents != null)
    .reduce((s, e) => s + (e.amount_cents ?? 0), 0);
  const mtdBusiness = ytd
    .filter((e) => e.is_business && e.amount_cents != null && e.expense_date && e.expense_date >= monthStart)
    .reduce((s, e) => s + (e.amount_cents ?? 0), 0);

  const businessCount = ytd.filter((e) => e.is_business).length;
  const personalCount = ytd.filter((e) => !e.is_business).length;
  const businessPct = ytdBusiness + ytdPersonal > 0
    ? Math.round((ytdBusiness / (ytdBusiness + ytdPersonal)) * 100)
    : 0;

  // By category (business only)
  const byCategoryMap = new Map<string, number>();
  for (const e of ytd) {
    if (!e.is_business || e.amount_cents == null) continue;
    const code = e.category_code ?? "other";
    byCategoryMap.set(code, (byCategoryMap.get(code) ?? 0) + (e.amount_cents ?? 0));
  }
  const byCategory = Array.from(byCategoryMap.entries())
    .map(([code, cents]) => ({ code, label: getCategory(code).label, cents }))
    .sort((a, b) => b.cents - a.cents);

  // Top merchants (business only)
  const merchantMap = new Map<string, number>();
  for (const e of ytd) {
    if (!e.is_business || e.amount_cents == null || !e.merchant) continue;
    merchantMap.set(e.merchant, (merchantMap.get(e.merchant) ?? 0) + (e.amount_cents ?? 0));
  }
  const topMerchants = Array.from(merchantMap.entries())
    .map(([name, cents]) => ({ name, cents }))
    .sort((a, b) => b.cents - a.cents)
    .slice(0, 5);

  // Monthly trend — last 12 months, including months with no data
  const trendData = (() => {
    const out: { date: string; value: number }[] = [];
    const cursor = new Date(now.getFullYear(), now.getMonth() - 11, 1);
    for (let i = 0; i < 12; i++) {
      const year = cursor.getFullYear();
      const month = cursor.getMonth();
      const start = new Date(year, month, 1).toISOString().split("T")[0];
      const end = new Date(year, month + 1, 1).toISOString().split("T")[0];
      const sum = trend
        .filter(
          (e) =>
            e.is_business &&
            e.amount_cents != null &&
            e.expense_date &&
            e.expense_date >= start &&
            e.expense_date < end,
        )
        .reduce((s, e) => s + (e.amount_cents ?? 0), 0);
      const label =
        year === now.getFullYear()
          ? MONTH_LABELS[month]
          : `${MONTH_LABELS[month]} '${String(year).slice(-2)}`;
      out.push({ date: label, value: Math.round(sum / 100) });
      cursor.setMonth(month + 1);
    }
    return out;
  })();

  const maxCategory = byCategory[0]?.cents ?? 0;
  const maxMerchant = topMerchants[0]?.cents ?? 0;

  return (
    <div className="mx-auto max-w-4xl px-4 pt-6 lg:pt-10 pb-12">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Year-to-date overview · {new Date().getFullYear()}
        </p>
      </div>

      {/* Stat tiles */}
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="YTD Deductible" value={formatCents(ytdBusiness)} sub={`${businessCount} business expense${businessCount === 1 ? "" : "s"}`} />
        <Stat label="MTD Deductible" value={formatCents(mtdBusiness)} sub="This month" />
        <Stat label="Personal" value={formatCents(ytdPersonal)} sub={`${personalCount} non-deductible`} />
        <Stat label="Business / Personal" value={`${businessPct}% / ${100 - businessPct}%`} sub="Of YTD spend" />
      </div>

      {/* Monthly trend (Recharts area chart) */}
      <div className="mb-6">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-gray-400">
          Monthly trend — business
        </h2>
        {trend.length === 0 ? (
          <EmptyCard text="No expenses in the last 12 months yet." />
        ) : (
          <Chart data={trendData} color="#6366f1" height={220} />
        )}
      </div>

      {/* Category breakdown + top merchants — side by side on desktop */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <section>
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-gray-400">
            By category — business
          </h2>
          {byCategory.length === 0 ? (
            <EmptyCard text="No categorized business expenses yet." />
          ) : (
            <div className="rounded-xl bg-white p-4 shadow-sm">
              <ul className="space-y-3">
                {byCategory.map((c) => (
                  <li key={c.code}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="text-gray-700">{c.label}</span>
                      <span className="font-semibold text-gray-900">{formatCents(c.cents)}</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full bg-indigo-500"
                        style={{ width: `${maxCategory > 0 ? Math.max(2, (c.cents / maxCategory) * 100) : 0}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-gray-400">
            Top merchants
          </h2>
          {topMerchants.length === 0 ? (
            <EmptyCard text="No merchants yet." />
          ) : (
            <div className="rounded-xl bg-white p-4 shadow-sm">
              <ul className="space-y-3">
                {topMerchants.map((m) => (
                  <li key={m.name}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="truncate text-gray-700">{m.name}</span>
                      <span className="font-semibold text-gray-900">{formatCents(m.cents)}</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full bg-amber-500"
                        style={{ width: `${maxMerchant > 0 ? Math.max(2, (m.cents / maxMerchant) * 100) : 0}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      </div>

      {/* Footer links */}
      <div className="mt-8 flex gap-3 text-sm">
        <Link
          href="/expenses"
          className="rounded-xl border border-gray-200 bg-white px-4 py-2 font-medium text-gray-700 hover:bg-gray-50"
        >
          All expenses
        </Link>
        <Link
          href="/expenses/export"
          className="rounded-xl border border-gray-200 bg-white px-4 py-2 font-medium text-gray-700 hover:bg-gray-50"
        >
          Export CSV
        </Link>
      </div>
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl bg-white p-4 shadow-sm">
      <p className="text-[10px] uppercase tracking-wider text-gray-400">{label}</p>
      <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-gray-500">{sub}</p>}
    </div>
  );
}

function EmptyCard({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-dashed border-gray-300 bg-white p-6 text-center text-sm text-gray-500">
      {text}
    </div>
  );
}
