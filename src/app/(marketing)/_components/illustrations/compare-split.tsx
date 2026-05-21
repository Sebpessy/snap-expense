// Split scene: cluttered spreadsheet on the left vs clean phone on the right.
export function CompareSplit({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 640 360"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="left-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f1f5f9" />
          <stop offset="1" stopColor="#e2e8f0" />
        </linearGradient>
        <linearGradient id="right-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#1e3a8a" />
          <stop offset="1" stopColor="#2563eb" />
        </linearGradient>
      </defs>

      {/* LEFT half — cluttered spreadsheet */}
      <rect x="0" y="0" width="320" height="360" fill="url(#left-bg)" />
      <g transform="translate(28 28)">
        {/* monitor */}
        <rect width="264" height="200" rx="6" fill="#cbd5e1" />
        <rect x="6" y="6" width="252" height="180" rx="3" fill="#ffffff" />
        {/* spreadsheet grid — too many cells */}
        {Array.from({ length: 12 }).map((_, c) =>
          Array.from({ length: 9 }).map((_, r) => (
            <rect
              key={`${c}-${r}`}
              x={10 + c * 21}
              y={12 + r * 19}
              width="20"
              height="18"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="0.7"
            />
          )),
        )}
        {/* random scattered values */}
        {[
          [2, 1], [4, 2], [7, 3], [1, 4], [9, 5], [6, 6], [3, 7], [10, 2], [5, 5], [8, 0], [0, 6], [11, 4]
        ].map(([c, r], i) => (
          <text
            key={i}
            x={12 + c * 21}
            y={26 + r * 19}
            fontFamily="ui-sans-serif, system-ui"
            fontSize="7"
            fill="#94a3b8"
          >
            $·
          </text>
        ))}
        {/* monitor stand */}
        <rect x="118" y="200" width="28" height="14" fill="#94a3b8" />
        <rect x="100" y="214" width="64" height="6" rx="2" fill="#64748b" />
      </g>

      {/* scattered papers */}
      <g transform="translate(40 250)" opacity="0.9">
        <rect x="0" y="0" width="44" height="58" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" transform="rotate(-6)" />
        <rect x="40" y="6" width="44" height="58" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" transform="rotate(8)" />
        <rect x="86" y="0" width="44" height="58" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" transform="rotate(-3)" />
      </g>

      {/* coffee mug */}
      <g transform="translate(230 286)">
        <rect width="32" height="36" rx="4" fill="#94a3b8" />
        <ellipse cx="16" cy="6" rx="14" ry="4" fill="#1f2937" />
        <path d="M32 12 q10 2 0 16" fill="none" stroke="#94a3b8" strokeWidth="3" />
      </g>

      {/* SEAM */}
      <rect x="316" y="0" width="8" height="360" fill="#cbd5e1" />

      {/* RIGHT half — clean phone */}
      <rect x="324" y="0" width="316" height="360" fill="url(#right-bg)" />
      {/* abstract glow */}
      <circle cx="500" cy="200" r="160" fill="#28D4E1" opacity="0.18" />

      <g transform="translate(388 30)">
        {/* phone */}
        <rect width="188" height="304" rx="32" fill="#0f172a" />
        <rect x="8" y="8" width="172" height="288" rx="26" fill="#ffffff" />
        {/* notch */}
        <rect x="76" y="14" width="36" height="8" rx="4" fill="#0f172a" />
        {/* one focused expense */}
        <text x="22" y="50" fontFamily="ui-sans-serif, system-ui" fontSize="9" fontWeight="700" fill="#2563eb" letterSpacing="0.5">SAVED · 2s AGO</text>
        <text x="22" y="78" fontFamily="ui-sans-serif, system-ui" fontSize="22" fontWeight="800" fill="#0f172a">$184.20</text>
        <text x="22" y="98" fontFamily="ui-sans-serif, system-ui" fontSize="11" fontWeight="600" fill="#64748b">Office Depot</text>

        <rect x="22" y="116" width="144" height="44" rx="10" fill="#eff6ff" />
        <text x="32" y="134" fontFamily="ui-sans-serif, system-ui" fontSize="9" fontWeight="700" fill="#1d4ed8" letterSpacing="0.4">PROJECT</text>
        <text x="32" y="150" fontFamily="ui-sans-serif, system-ui" fontSize="12" fontWeight="700" fill="#0f172a">Q3 Client Retainer</text>

        <rect x="22" y="170" width="144" height="44" rx="10" fill="#f5f3ff" />
        <text x="32" y="188" fontFamily="ui-sans-serif, system-ui" fontSize="9" fontWeight="700" fill="#6A3BC8" letterSpacing="0.4">CATEGORY</text>
        <text x="32" y="204" fontFamily="ui-sans-serif, system-ui" fontSize="12" fontWeight="700" fill="#0f172a">Office Supplies</text>

        <rect x="22" y="224" width="144" height="44" rx="10" fill="#ecfdf5" />
        <text x="32" y="242" fontFamily="ui-sans-serif, system-ui" fontSize="9" fontWeight="700" fill="#0e7490" letterSpacing="0.4">PAID WITH</text>
        <text x="32" y="258" fontFamily="ui-sans-serif, system-ui" fontSize="12" fontWeight="700" fill="#0f172a">Amex •1009</text>
      </g>
    </svg>
  );
}
