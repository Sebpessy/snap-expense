import Link from "next/link";
import {
  Users,
  CreditCard,
  Clock,
  DollarSign,
  CheckCircle2,
  XCircle,
  ArrowRight,
} from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatCents } from "@/lib/types";
import { getPlansByCode } from "@/lib/plans";
import { Chart } from "@/components/ui/chart";

export default async function AdminDashboardPage() {
  const supabase = createAdminClient();

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const thirtyDaysAgoISO = thirtyDaysAgo.toISOString();

  // Plans first so we know which codes count as "paying"
  const plansByCode = await getPlansByCode();
  const paidPlanCodes = Object.values(plansByCode)
    .filter((p) => (p.monthly_price_cents ?? 0) > 0)
    .map((p) => p.code);
  const freePlanCode = "free";

  // Fetch all stats in parallel
  const [
    { count: totalUsers },
    { count: payingUsers },
    { count: trialUsers },
    { data: activeSubscriptions },
    { data: recentSignups },
    { count: canceledLast30 },
    { count: activeThen },
    { data: webhookEvents },
  ] = await Promise.all([
    // Total users
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true }),
    // Paying users — anyone on a plan with a positive price
    paidPlanCodes.length > 0
      ? supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .in("plan", paidPlanCodes)
      : Promise.resolve({ count: 0 }),
    // Trial users — on the free plan with trial not yet expired
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("plan", freePlanCode)
      .gt("trial_ends_at", new Date().toISOString()),
    // Active subscriptions for MRR
    supabase
      .from("subscriptions")
      .select("plan, quantity")
      .in("status", ["active", "trialing"]),
    // Signups per day (last 30 days)
    supabase
      .from("profiles")
      .select("created_at")
      .gte("created_at", thirtyDaysAgoISO)
      .order("created_at", { ascending: true }),
    // Canceled last 30 days
    supabase
      .from("subscriptions")
      .select("*", { count: "exact", head: true })
      .eq("status", "canceled")
      .gte("created_at", thirtyDaysAgoISO),
    // Active subscriptions 30 days ago (approximation: active + canceled)
    supabase
      .from("subscriptions")
      .select("*", { count: "exact", head: true })
      .lte("created_at", thirtyDaysAgoISO),
    // Recent webhook events
    supabase
      .from("webhook_events")
      .select("id, stripe_event_id, event_type, processed, processed_at, error_message")
      .order("processed_at", { ascending: false })
      .limit(10),
  ]);

  // Calculate MRR using prices from the plans table
  const mrr = (activeSubscriptions ?? []).reduce((sum, sub) => {
    const plan = plansByCode[sub.plan as string];
    const price = plan?.monthly_price_cents ?? 0;
    return sum + price * (sub.quantity ?? 1);
  }, 0);

  // Calculate churn rate
  const churnDenominator = (activeThen ?? 0) + (canceledLast30 ?? 0);
  const churnRate =
    churnDenominator > 0
      ? ((canceledLast30 ?? 0) / churnDenominator) * 100
      : 0;

  // Build growth chart data (last 30 days)
  const growthMap: Record<string, number> = {};
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    growthMap[d.toISOString().slice(0, 10)] = 0;
  }
  (recentSignups ?? []).forEach((profile) => {
    const day = profile.created_at.slice(0, 10);
    if (growthMap[day] !== undefined) {
      growthMap[day]++;
    }
  });
  const growthData = Object.entries(growthMap).map(([date, value]) => ({
    date: date.slice(5), // MM-DD
    value,
  }));

  const stats = [
    {
      label: "Total Users",
      value: totalUsers ?? 0,
      icon: Users,
      color: "text-blue-600 bg-blue-50",
    },
    {
      label: "Paying Users",
      value: payingUsers ?? 0,
      icon: CreditCard,
      color: "text-green-600 bg-green-50",
    },
    {
      label: "Trial Users",
      value: trialUsers ?? 0,
      icon: Clock,
      color: "text-amber-600 bg-amber-50",
    },
    {
      label: "MRR",
      value: formatCents(mrr),
      icon: DollarSign,
      color: "text-purple-600 bg-purple-50",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          Overview of Xpenz metrics
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4"
            >
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Growth chart and churn */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            User Growth (Last 30 Days)
          </h2>
          <Chart data={growthData} color="#3b82f6" height={280} />
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col items-center justify-center">
          <p className="text-sm text-gray-500 mb-2">Churn Rate (30d)</p>
          <p
            className={`text-4xl font-bold ${
              churnRate > 10
                ? "text-red-600"
                : churnRate > 5
                ? "text-amber-600"
                : "text-green-600"
            }`}
          >
            {churnRate.toFixed(1)}%
          </p>
          <p className="text-xs text-gray-400 mt-2">
            {canceledLast30 ?? 0} canceled / {churnDenominator} total
          </p>
        </div>
      </div>

      {/* Recent webhooks */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">
            Recent Webhook Events
          </h2>
          <Link
            href="/admin/webhooks"
            className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">
                    Event Type
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">
                    Processed At
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(!webhookEvents || webhookEvents.length === 0) ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-4 py-6 text-center text-gray-400"
                    >
                      No webhook events yet
                    </td>
                  </tr>
                ) : (
                  webhookEvents.map((event) => (
                    <tr key={event.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-700 font-mono text-xs">
                        {event.event_type}
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {event.processed_at
                          ? new Date(event.processed_at).toLocaleString()
                          : "—"}
                      </td>
                      <td className="px-4 py-3">
                        {event.processed ? (
                          <span className="inline-flex items-center gap-1 text-green-600">
                            <CheckCircle2 className="w-4 h-4" /> OK
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-red-600">
                            <XCircle className="w-4 h-4" /> Failed
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
