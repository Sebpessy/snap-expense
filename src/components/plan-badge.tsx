type PlanBadgeProps = {
  plan: string;
  trialActive?: boolean;
};

const planStyles: Record<string, string> = {
  free: "bg-gray-100 text-gray-600",
  pro: "bg-brand-100 text-brand-700",
  business: "bg-purple-100 text-purple-700",
  trial: "bg-amber-100 text-amber-700",
};

export function PlanBadge({ plan, trialActive = false }: PlanBadgeProps) {
  const displayPlan = trialActive ? "trial" : plan;
  const label = trialActive
    ? "Trial"
    : plan.charAt(0).toUpperCase() + plan.slice(1);
  const styles = planStyles[displayPlan] || planStyles.free;

  return (
    <span
      className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full ${styles}`}
    >
      {label}
    </span>
  );
}
