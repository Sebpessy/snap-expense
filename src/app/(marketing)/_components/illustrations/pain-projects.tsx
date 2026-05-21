// Stack of project folders with question marks — "which one is bleeding?"
export function PainProjects({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="prj-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fee2e2" />
          <stop offset="1" stopColor="#fecaca" />
        </linearGradient>
      </defs>
      <circle cx="100" cy="100" r="90" fill="url(#prj-bg)" />

      {/* stacked folders */}
      <Folder x={28} y={66} color="#fbbf24" tab="A" />
      <Folder x={48} y={84} color="#a78bfa" tab="B" />
      <Folder x={68} y={102} color="#38bdf8" tab="C" />
      <Folder x={88} y={120} color="#fb7185" tab="?" />

      {/* floating question marks */}
      <text x="148" y="74" fontFamily="ui-sans-serif, system-ui" fontSize="26" fontWeight="800" fill="#dc2626">?</text>
      <text x="170" y="120" fontFamily="ui-sans-serif, system-ui" fontSize="20" fontWeight="800" fill="#dc2626" opacity="0.7">?</text>
      <text x="36" y="186" fontFamily="ui-sans-serif, system-ui" fontSize="18" fontWeight="800" fill="#dc2626" opacity="0.6">?</text>
    </svg>
  );
}

function Folder({
  x,
  y,
  color,
  tab,
}: {
  x: number;
  y: number;
  color: string;
  tab: string;
}) {
  return (
    <g transform={`translate(${x} ${y})`}>
      {/* tab */}
      <rect x="6" y="0" width="36" height="10" rx="3" fill={color} />
      {/* body */}
      <rect x="0" y="6" width="100" height="48" rx="6" fill={color} />
      <rect x="2" y="8" width="96" height="44" rx="5" fill="#ffffff" opacity="0.18" />
      <text x="50" y="36" textAnchor="middle" fontFamily="ui-sans-serif, system-ui" fontSize="18" fontWeight="800" fill="#ffffff">{tab}</text>
    </g>
  );
}
