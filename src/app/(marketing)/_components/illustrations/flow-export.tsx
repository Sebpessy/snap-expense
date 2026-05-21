// Step 3: Export — clean spreadsheet result + green checkmark.
export function FlowExport({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 320 400"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="exp-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ecfdf5" />
          <stop offset="1" stopColor="#d1fae5" />
        </linearGradient>
      </defs>

      <rect width="320" height="400" rx="24" fill="url(#exp-bg)" />

      {/* document */}
      <g transform="translate(40 50)">
        <rect width="240" height="300" rx="12" fill="#ffffff" stroke="#d1d5db" strokeWidth="1.5" />
        {/* title bar */}
        <rect x="0" y="0" width="240" height="38" rx="12" fill="#1e3a8a" />
        <text x="14" y="24" fontFamily="ui-sans-serif, system-ui" fontSize="12" fontWeight="800" fill="#ffffff">expenses_q3_2026.csv</text>

        {/* column headers */}
        <g transform="translate(0 48)" fontFamily="ui-sans-serif, system-ui" fontSize="9" fontWeight="700" fill="#374151" letterSpacing="0.4">
          <rect x="6" y="0" width="58" height="18" rx="3" fill="#f3f4f6" />
          <text x="14" y="13">VENDOR</text>
          <rect x="68" y="0" width="44" height="18" rx="3" fill="#f3f4f6" />
          <text x="76" y="13">AMOUNT</text>
          <rect x="116" y="0" width="58" height="18" rx="3" fill="#f3f4f6" />
          <text x="124" y="13">CATEGORY</text>
          <rect x="178" y="0" width="56" height="18" rx="3" fill="#f3f4f6" />
          <text x="186" y="13">PROJECT</text>
        </g>

        {/* rows */}
        <Row y={76} cells={["Office Depot", "$184.20", "Supplies", "Q3 Retainer"]} />
        <Row y={102} cells={["Adobe", "$54.99", "Software", "Q3 Retainer"]} />
        <Row y={128} cells={["Hex Studio", "$1,200.00", "1099", "Acme Rebrand"]} />
        <Row y={154} cells={["Shell", "$62.40", "Vehicle", "—"]} />
        <Row y={180} cells={["Verizon", "$95.00", "Utilities", "—"]} />
        <Row y={206} cells={["Canva Pro", "$12.99", "Software", "Q3 Retainer"]} />
        <Row y={232} cells={["UPS Store", "$31.40", "Shipping", "Acme Rebrand"]} />
      </g>

      {/* checkmark badge */}
      <g transform="translate(220 290)">
        <circle r="32" fill="#22c55e" />
        <path d="M-12 0 l8 8 l16 -16" stroke="#ffffff" strokeWidth="4.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  );
}

function Row({ y, cells }: { y: number; cells: [string, string, string, string] }) {
  return (
    <g transform={`translate(0 ${y})`} fontFamily="ui-sans-serif, system-ui" fontSize="9" fill="#1f2937">
      <line x1="6" y1="18" x2="234" y2="18" stroke="#e5e7eb" strokeWidth="0.8" />
      <text x="14" y="12">{cells[0]}</text>
      <text x="76" y="12" fontWeight="700">{cells[1]}</text>
      <text x="124" y="12">{cells[2]}</text>
      <text x="186" y="12">{cells[3]}</text>
    </g>
  );
}
