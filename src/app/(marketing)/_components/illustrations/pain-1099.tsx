// 1099 tax form lying on a surface — "the January fire drill."
// Replaces the previous "tangled payments" illustration with something more
// direct: the document itself, the one that ruins a perfectly good morning.
export function Pain1099({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="t99-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fee2e2" />
          <stop offset="1" stopColor="#fecaca" />
        </linearGradient>
        <linearGradient id="t99-paper" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#f5f0e1" />
        </linearGradient>
        <filter id="t99-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" />
          <feOffset dx="0" dy="3" result="off" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.18" />
          </feComponentTransfer>
        </filter>
      </defs>

      {/* red circle bg — matches the other pain cards */}
      <circle cx="100" cy="100" r="90" fill="url(#t99-bg)" />

      {/* peeking-second-page underneath */}
      <g transform="translate(100 100) rotate(-3) translate(-78 -56)">
        <rect width="156" height="112" rx="2" fill="#e7d9b8" opacity="0.7" filter="url(#t99-shadow)" />
      </g>

      {/* main 1099 form, tilted */}
      <g transform="translate(100 100) rotate(-8) translate(-80 -58)">
        {/* paper */}
        <rect width="160" height="116" rx="2" fill="url(#t99-paper)" stroke="#d6c6a3" strokeWidth="0.8" filter="url(#t99-shadow)" />

        {/* small header row */}
        <rect x="8" y="6" width="40" height="6" rx="1" fill="none" stroke="#1f2937" strokeWidth="0.6" />
        <text x="10" y="11" fontFamily="ui-sans-serif, system-ui" fontSize="3.2" fontWeight="700" fill="#374151" letterSpacing="0.1">VOID</text>
        <rect x="52" y="6" width="50" height="6" rx="1" fill="none" stroke="#1f2937" strokeWidth="0.6" />
        <text x="54" y="11" fontFamily="ui-sans-serif, system-ui" fontSize="3.2" fontWeight="700" fill="#374151" letterSpacing="0.1">CORRECTED</text>

        {/* form code top-right */}
        <text x="152" y="11" textAnchor="end" fontFamily="ui-sans-serif, system-ui" fontSize="4" fontWeight="700" fill="#1f2937">Form 1099-NEC</text>

        {/* big 1099 numeral — the iconic visual cue */}
        <text
          x="14"
          y="62"
          fontFamily="Georgia, ui-serif, serif"
          fontSize="42"
          fontWeight="900"
          fill="#0f172a"
          letterSpacing="-1"
        >
          1099
        </text>

        {/* horizontal rule */}
        <line x1="8" y1="70" x2="152" y2="70" stroke="#94a3b8" strokeWidth="0.6" />

        {/* form fields — labeled small rectangles */}
        <FormField x={8} y={76} w={70} label="PAYER'S name, address" />
        <FormField x={82} y={76} w={70} label="RECIPIENT'S TIN" />

        <FormField x={8} y={92} w={45} label="1 Nonemployee comp" amount="$3,200" />
        <FormField x={55} y={92} w={45} label="2 Royalties" />
        <FormField x={102} y={92} w={50} label="4 Federal tax withheld" />

        {/* red ink stamp accent — "FILE BY JAN 31" feels — adds urgency */}
        <g transform="translate(110 50) rotate(-12)">
          <rect width="44" height="14" rx="1.5" fill="none" stroke="#dc2626" strokeWidth="1.2" opacity="0.85" />
          <text x="22" y="9.5" textAnchor="middle" fontFamily="ui-sans-serif, system-ui" fontSize="4.5" fontWeight="800" fill="#dc2626" opacity="0.9" letterSpacing="0.3">JAN 31</text>
        </g>
      </g>

      {/* paperclip / pen accent — adds depth */}
      <g transform="translate(36 168) rotate(-22)">
        <rect width="42" height="3" rx="1.5" fill="#1e3a8a" />
        <circle cx="0" cy="1.5" r="2" fill="#1e3a8a" />
        <circle cx="42" cy="1.5" r="1.4" fill="#fbbf24" />
      </g>
    </svg>
  );
}

function FormField({
  x,
  y,
  w,
  label,
  amount,
}: {
  x: number;
  y: number;
  w: number;
  label: string;
  amount?: string;
}) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect width={w} height="14" rx="0.6" fill="#ffffff" stroke="#94a3b8" strokeWidth="0.5" />
      <text x="2" y="4" fontFamily="ui-sans-serif, system-ui" fontSize="2.4" fontWeight="700" fill="#475569" letterSpacing="0.05">{label}</text>
      {amount && (
        <text x={w - 2} y="11" textAnchor="end" fontFamily="ui-sans-serif, system-ui" fontSize="5" fontWeight="800" fill="#0f172a">{amount}</text>
      )}
    </g>
  );
}
