// Step 1: Snap — phone with camera viewfinder over a receipt.
export function FlowSnap({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 320 400"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="snap-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#eff6ff" />
          <stop offset="1" stopColor="#dbeafe" />
        </linearGradient>
        <linearGradient id="snap-glow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#28D4E1" stopOpacity="0.7" />
          <stop offset="1" stopColor="#28D4E1" stopOpacity="0" />
        </linearGradient>
      </defs>

      <rect width="320" height="400" rx="24" fill="url(#snap-bg)" />

      {/* receipt at bottom */}
      <g transform="translate(86 220) rotate(-6)">
        <rect width="148" height="170" rx="6" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" />
        <line x1="14" y1="20" x2="134" y2="20" stroke="#64748b" strokeWidth="1.6" />
        <line x1="14" y1="34" x2="120" y2="34" stroke="#94a3b8" strokeWidth="1" />
        <line x1="14" y1="46" x2="134" y2="46" stroke="#94a3b8" strokeWidth="1" />
        <line x1="14" y1="58" x2="108" y2="58" stroke="#94a3b8" strokeWidth="1" />
        <line x1="14" y1="70" x2="124" y2="70" stroke="#94a3b8" strokeWidth="1" />
        <line x1="14" y1="82" x2="100" y2="82" stroke="#94a3b8" strokeWidth="1" />
        <line x1="14" y1="94" x2="134" y2="94" stroke="#94a3b8" strokeWidth="1" />
        <line x1="14" y1="120" x2="134" y2="120" stroke="#1e3a8a" strokeWidth="1.6" />
        <text x="14" y="142" fontFamily="ui-sans-serif, system-ui" fontSize="11" fontWeight="700" fill="#1e3a8a">TOTAL</text>
        <text x="134" y="142" textAnchor="end" fontFamily="ui-sans-serif, system-ui" fontSize="13" fontWeight="800" fill="#0f172a">$184.20</text>
      </g>

      {/* phone */}
      <g transform="translate(60 30)">
        <rect width="200" height="280" rx="34" fill="#0f172a" />
        <rect x="10" y="10" width="180" height="260" rx="26" fill="#000000" />
        {/* viewfinder corners */}
        <g stroke="#28D4E1" strokeWidth="3" fill="none" strokeLinecap="round">
          <path d="M30 50 v-10 h10" />
          <path d="M170 50 v-10 h-10" />
          <path d="M30 230 v10 h10" />
          <path d="M170 230 v10 h-10" />
        </g>
        {/* shutter button */}
        <circle cx="100" cy="248" r="14" fill="#ffffff" />
        <circle cx="100" cy="248" r="10" fill="#0f172a" />
        {/* scan glow line */}
        <rect x="32" y="140" width="136" height="22" rx="6" fill="url(#snap-glow)" />
        {/* detection box */}
        <rect x="40" y="98" width="120" height="56" rx="6" fill="none" stroke="#22c55e" strokeWidth="2" strokeDasharray="4 3" />
        <text x="46" y="92" fontFamily="ui-sans-serif, system-ui" fontSize="9" fontWeight="700" fill="#22c55e">$184.20 detected</text>
      </g>
    </svg>
  );
}
