// Pile of receipts spilling from a folder. Decorative.
export function PainReceipts({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="rec-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fee2e2" />
          <stop offset="1" stopColor="#fecaca" />
        </linearGradient>
      </defs>
      <circle cx="100" cy="100" r="90" fill="url(#rec-bg)" />

      {/* receipts — rotated rectangles with horizontal lines */}
      <Receipt x={42} y={70} rotate={-14} />
      <Receipt x={90} y={58} rotate={6} />
      <Receipt x={62} y={100} rotate={-3} />
      <Receipt x={108} y={94} rotate={18} />
      <Receipt x={78} y={130} rotate={-22} />

      {/* folder lip */}
      <path d="M30 156 Q100 142 170 156 L170 184 Q100 174 30 184 Z" fill="#b91c1c" />
      <path d="M30 156 Q100 142 170 156" fill="none" stroke="#7f1d1d" strokeWidth="2" />
    </svg>
  );
}

function Receipt({ x, y, rotate }: { x: number; y: number; rotate: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate})`}>
      <rect width="46" height="64" rx="3" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" />
      <path d="M0 0 l4 4 l-4 4 l4 4 l-4 4 l4 4 l-4 4" transform="translate(0 -2) scale(11.5 1)" fill="none" />
      <line x1="6" y1="10" x2="40" y2="10" stroke="#64748b" strokeWidth="1.4" />
      <line x1="6" y1="20" x2="34" y2="20" stroke="#94a3b8" strokeWidth="1" />
      <line x1="6" y1="28" x2="40" y2="28" stroke="#94a3b8" strokeWidth="1" />
      <line x1="6" y1="36" x2="30" y2="36" stroke="#94a3b8" strokeWidth="1" />
      <line x1="6" y1="50" x2="40" y2="50" stroke="#dc2626" strokeWidth="1.4" />
    </g>
  );
}
