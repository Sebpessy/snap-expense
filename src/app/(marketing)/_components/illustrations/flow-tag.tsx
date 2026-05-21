// Step 2: Tag — phone showing project + category selectors.
export function FlowTag({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 320 400"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="tag-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f5f3ff" />
          <stop offset="1" stopColor="#ede9fe" />
        </linearGradient>
      </defs>

      <rect width="320" height="400" rx="24" fill="url(#tag-bg)" />

      {/* phone */}
      <g transform="translate(60 30)">
        <rect width="200" height="340" rx="34" fill="#0f172a" />
        <rect x="10" y="10" width="180" height="320" rx="26" fill="#ffffff" />

        {/* header */}
        <text x="100" y="46" textAnchor="middle" fontFamily="ui-sans-serif, system-ui" fontSize="13" fontWeight="800" fill="#0f172a">Tag this expense</text>

        {/* captured amount */}
        <rect x="22" y="60" width="156" height="40" rx="10" fill="#eff6ff" />
        <text x="32" y="84" fontFamily="ui-sans-serif, system-ui" fontSize="14" fontWeight="800" fill="#1e3a8a">$184.20</text>
        <text x="168" y="84" textAnchor="end" fontFamily="ui-sans-serif, system-ui" fontSize="10" fontWeight="600" fill="#1e3a8a">Office Depot</text>

        {/* project picker — selected */}
        <text x="22" y="124" fontFamily="ui-sans-serif, system-ui" fontSize="9" fontWeight="700" fill="#6b7280" letterSpacing="0.6">PROJECT</text>
        <rect x="22" y="132" width="156" height="36" rx="10" fill="none" stroke="#6A3BC8" strokeWidth="2" />
        <text x="32" y="155" fontFamily="ui-sans-serif, system-ui" fontSize="12" fontWeight="700" fill="#0f172a">Q3 Client Retainer</text>
        <circle cx="166" cy="150" r="6" fill="#6A3BC8" />
        <path d="M163 150 l2 2 l4 -4" stroke="#ffffff" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />

        {/* category picker — selected */}
        <text x="22" y="194" fontFamily="ui-sans-serif, system-ui" fontSize="9" fontWeight="700" fill="#6b7280" letterSpacing="0.6">CATEGORY</text>
        <rect x="22" y="202" width="156" height="36" rx="10" fill="none" stroke="#28D4E1" strokeWidth="2" />
        <text x="32" y="225" fontFamily="ui-sans-serif, system-ui" fontSize="12" fontWeight="700" fill="#0f172a">Office Supplies · Line 22</text>

        {/* payment method */}
        <text x="22" y="262" fontFamily="ui-sans-serif, system-ui" fontSize="9" fontWeight="700" fill="#6b7280" letterSpacing="0.6">PAID WITH</text>
        <rect x="22" y="270" width="74" height="32" rx="10" fill="#1e3a8a" />
        <text x="59" y="290" textAnchor="middle" fontFamily="ui-sans-serif, system-ui" fontSize="11" fontWeight="700" fill="#ffffff">Amex •1009</text>

        {/* save button */}
        <rect x="22" y="318" width="156" height="36" rx="10" fill="#22c55e" />
        <text x="100" y="341" textAnchor="middle" fontFamily="ui-sans-serif, system-ui" fontSize="12" fontWeight="800" fill="#ffffff">Save expense</text>
      </g>
    </svg>
  );
}
