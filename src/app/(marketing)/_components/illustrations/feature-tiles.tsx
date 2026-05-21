// Six small SVG scenes that sit at the top of each feature card.
// All share a 240×140 viewBox and a soft gradient background so they
// visually rhyme across the grid.

type TileProps = { className?: string };

function TileFrame({
  children,
  gradId,
  from,
  to,
}: {
  children: React.ReactNode;
  gradId: string;
  from: string;
  to: string;
}) {
  return (
    <>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={from} />
          <stop offset="1" stopColor={to} />
        </linearGradient>
      </defs>
      <rect width="240" height="140" fill={`url(#${gradId})`} />
      {children}
    </>
  );
}

/* ---------------------------------------------------------------- */
/* 1. AI receipt scan                                                */
/* ---------------------------------------------------------------- */
export function FeatureScanTile({ className }: TileProps) {
  return (
    <svg viewBox="0 0 240 140" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <TileFrame gradId="scan-bg" from="#eff6ff" to="#dbeafe">
        {/* receipt */}
        <g transform="translate(46 22)">
          <rect width="84" height="96" rx="4" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.2" />
          <line x1="10" y1="14" x2="74" y2="14" stroke="#1e3a8a" strokeWidth="1.4" />
          <line x1="10" y1="26" x2="60" y2="26" stroke="#94a3b8" strokeWidth="0.9" />
          <line x1="10" y1="34" x2="70" y2="34" stroke="#94a3b8" strokeWidth="0.9" />
          <line x1="10" y1="42" x2="52" y2="42" stroke="#94a3b8" strokeWidth="0.9" />
          <line x1="10" y1="50" x2="66" y2="50" stroke="#94a3b8" strokeWidth="0.9" />
          <line x1="10" y1="64" x2="74" y2="64" stroke="#1e3a8a" strokeWidth="1.2" />
          <text x="10" y="78" fontFamily="ui-sans-serif, system-ui" fontSize="8" fontWeight="700" fill="#1e3a8a">TOTAL</text>
          <text x="74" y="78" textAnchor="end" fontFamily="ui-sans-serif, system-ui" fontSize="10" fontWeight="800" fill="#0f172a">$184</text>
        </g>
        {/* detection box overlay */}
        <rect x="42" y="74" width="92" height="28" rx="5" fill="none" stroke="#22c55e" strokeWidth="2" strokeDasharray="4 3" />
        {/* phone frame outline */}
        <rect x="140" y="14" width="78" height="112" rx="14" fill="#0f172a" />
        <rect x="146" y="20" width="66" height="100" rx="9" fill="#ffffff" />
        {/* viewfinder corners on phone */}
        <g stroke="#28D4E1" strokeWidth="2" fill="none" strokeLinecap="round">
          <path d="M152 32 v-4 h4" />
          <path d="M206 32 v-4 h-4" />
          <path d="M152 108 v4 h4" />
          <path d="M206 108 v4 h-4" />
        </g>
        {/* scan glow */}
        <rect x="152" y="64" width="54" height="14" rx="3" fill="#28D4E1" opacity="0.45" />
      </TileFrame>
    </svg>
  );
}

/* ---------------------------------------------------------------- */
/* 2. Per-project allocation                                         */
/* ---------------------------------------------------------------- */
export function FeatureProjectsTile({ className }: TileProps) {
  return (
    <svg viewBox="0 0 240 140" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <TileFrame gradId="proj-bg" from="#f5f3ff" to="#ede9fe">
        {/* three project rows */}
        <ProjectRow y={18} name="Q3 Client Retainer" pct={0.72} color="#22c55e" />
        <ProjectRow y={56} name="Acme Rebrand" pct={0.48} color="#3979EE" />
        <ProjectRow y={94} name="Side Project" pct={0.92} color="#ef4444" />
      </TileFrame>
    </svg>
  );
}

function ProjectRow({ y, name, pct, color }: { y: number; name: string; pct: number; color: string }) {
  return (
    <g transform={`translate(20 ${y})`}>
      <rect width="200" height="28" rx="6" fill="#ffffff" stroke="#e5e7eb" strokeWidth="1" />
      <text x="10" y="13" fontFamily="ui-sans-serif, system-ui" fontSize="8" fontWeight="700" fill="#0f172a">{name}</text>
      <rect x="10" y="18" width="180" height="5" rx="2.5" fill="#f1f5f9" />
      <rect x="10" y="18" width={180 * pct} height="5" rx="2.5" fill={color} />
    </g>
  );
}

/* ---------------------------------------------------------------- */
/* 3. Pay-anyone ledger                                              */
/* ---------------------------------------------------------------- */
export function FeatureLedgerTile({ className }: TileProps) {
  return (
    <svg viewBox="0 0 240 140" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <TileFrame gradId="ledger-bg" from="#ecfdf5" to="#d1fae5">
        <LedgerRow y={16} initial="H" color="#6A3BC8" name="Hex Studio" tag="1099" amount="$1,200" />
        <LedgerRow y={52} initial="L" color="#3979EE" name="Lopez Design" tag="1099" amount="$840" />
        <LedgerRow y={88} initial="A" color="#28D4E1" name="Adobe" tag="vendor" amount="$54.99" />
      </TileFrame>
    </svg>
  );
}

function LedgerRow({
  y,
  initial,
  color,
  name,
  tag,
  amount,
}: {
  y: number;
  initial: string;
  color: string;
  name: string;
  tag: string;
  amount: string;
}) {
  const isContractor = tag === "1099";
  return (
    <g transform={`translate(16 ${y})`}>
      <rect width="208" height="28" rx="6" fill="#ffffff" stroke="#e5e7eb" strokeWidth="1" />
      <circle cx="16" cy="14" r="9" fill={color} />
      <text x="16" y="17" textAnchor="middle" fontFamily="ui-sans-serif, system-ui" fontSize="9" fontWeight="800" fill="#ffffff">{initial}</text>
      <text x="32" y="13" fontFamily="ui-sans-serif, system-ui" fontSize="8" fontWeight="700" fill="#0f172a">{name}</text>
      <rect x="32" y="17" width={isContractor ? 22 : 30} height="8" rx="4" fill={isContractor ? "#fde68a" : "#e5e7eb"} />
      <text x={32 + (isContractor ? 11 : 15)} y="23.5" textAnchor="middle" fontFamily="ui-sans-serif, system-ui" fontSize="6" fontWeight="700" fill={isContractor ? "#92400e" : "#374151"}>{tag}</text>
      <text x="198" y="17" textAnchor="end" fontFamily="ui-sans-serif, system-ui" fontSize="9" fontWeight="800" fill="#0f172a">{amount}</text>
    </g>
  );
}

/* ---------------------------------------------------------------- */
/* 4. Schedule C categories                                          */
/* ---------------------------------------------------------------- */
export function FeatureCategoriesTile({ className }: TileProps) {
  return (
    <svg viewBox="0 0 240 140" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <TileFrame gradId="cat-bg" from="#fef3c7" to="#fde68a">
        {/* header chip */}
        <rect x="20" y="14" width="200" height="22" rx="6" fill="#1e3a8a" />
        <text x="120" y="29" textAnchor="middle" fontFamily="ui-sans-serif, system-ui" fontSize="9" fontWeight="800" fill="#ffffff">SCHEDULE C</text>
        {/* category rows */}
        <CategoryRow y={44} line="08" name="Advertising" />
        <CategoryRow y={68} line="11" name="Contract Labor" highlight />
        <CategoryRow y={92} line="22" name="Supplies" />
        <CategoryRow y={116} line="—" name="…" muted />
      </TileFrame>
    </svg>
  );
}

function CategoryRow({
  y,
  line,
  name,
  highlight,
  muted,
}: {
  y: number;
  line: string;
  name: string;
  highlight?: boolean;
  muted?: boolean;
}) {
  return (
    <g transform={`translate(20 ${y})`}>
      <rect width="200" height="18" rx="4" fill={highlight ? "#1e3a8a" : "#ffffff"} stroke={highlight ? "#1e3a8a" : "#e5e7eb"} strokeWidth="1" />
      <text x="10" y="12" fontFamily="ui-sans-serif, system-ui" fontSize="8" fontWeight="700" fill={highlight ? "#fde68a" : muted ? "#94a3b8" : "#92400e"}>Line {line}</text>
      <text x="60" y="12" fontFamily="ui-sans-serif, system-ui" fontSize="8" fontWeight="700" fill={highlight ? "#ffffff" : muted ? "#94a3b8" : "#0f172a"}>{name}</text>
      {highlight && <text x="190" y="12" textAnchor="end" fontFamily="ui-sans-serif, system-ui" fontSize="7" fontWeight="700" fill="#fde68a">✓</text>}
    </g>
  );
}

/* ---------------------------------------------------------------- */
/* 5. Payment-method audit trail                                     */
/* ---------------------------------------------------------------- */
export function FeaturePaymentsTile({ className }: TileProps) {
  return (
    <svg viewBox="0 0 240 140" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <TileFrame gradId="pay-bg" from="#cffafe" to="#a5f3fc">
        {/* credit card */}
        <g transform="translate(20 18)">
          <rect width="200" height="34" rx="6" fill="#3979EE" />
          <rect x="14" y="22" width="40" height="4" rx="1.5" fill="#ffffff" opacity="0.55" />
          <text x="186" y="14" textAnchor="end" fontFamily="ui-sans-serif, system-ui" fontSize="7" fontWeight="700" fill="#ffffff" opacity="0.7">CARD</text>
          <text x="186" y="28" textAnchor="end" fontFamily="ui-sans-serif, system-ui" fontSize="10" fontWeight="800" fill="#ffffff">•••• 1009</text>
        </g>
        {/* check */}
        <g transform="translate(20 60)">
          <rect width="200" height="30" rx="6" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
          <text x="14" y="12" fontFamily="ui-sans-serif, system-ui" fontSize="7" fontWeight="700" fill="#1f2937" letterSpacing="0.4">CHECK</text>
          <text x="14" y="24" fontFamily="ui-sans-serif, system-ui" fontSize="10" fontWeight="800" fill="#0f172a">#1247</text>
          <text x="186" y="20" textAnchor="end" fontFamily="ui-sans-serif, system-ui" fontSize="9" fontWeight="800" fill="#0f172a">$3,200</text>
        </g>
        {/* zelle */}
        <g transform="translate(20 98)">
          <rect width="200" height="30" rx="6" fill="#6A3BC8" />
          <text x="14" y="12" fontFamily="ui-sans-serif, system-ui" fontSize="7" fontWeight="700" fill="#ffffff" opacity="0.75" letterSpacing="0.4">ZELLE</text>
          <text x="14" y="24" fontFamily="ui-sans-serif, system-ui" fontSize="10" fontWeight="800" fill="#ffffff">ref · A8F2</text>
          <text x="186" y="20" textAnchor="end" fontFamily="ui-sans-serif, system-ui" fontSize="9" fontWeight="800" fill="#ffffff">$840</text>
        </g>
      </TileFrame>
    </svg>
  );
}

/* ---------------------------------------------------------------- */
/* 6. CSV export for your CPA                                        */
/* ---------------------------------------------------------------- */
export function FeatureExportTile({ className }: TileProps) {
  return (
    <svg viewBox="0 0 240 140" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <TileFrame gradId="exp-bg" from="#ecfdf5" to="#a7f3d0">
        {/* document */}
        <g transform="translate(28 16)">
          <rect width="184" height="108" rx="6" fill="#ffffff" stroke="#e5e7eb" strokeWidth="1" />
          {/* filename bar */}
          <rect x="0" y="0" width="184" height="20" rx="6" fill="#1e3a8a" />
          <text x="10" y="14" fontFamily="ui-sans-serif, system-ui" fontSize="9" fontWeight="800" fill="#ffffff">expenses.csv</text>
          <circle cx="170" cy="10" r="3" fill="#22c55e" />
          {/* column headers */}
          <g transform="translate(0 26)" fontFamily="ui-sans-serif, system-ui" fontSize="6" fontWeight="700" fill="#374151">
            <rect x="6" y="0" width="40" height="10" rx="2" fill="#f3f4f6" />
            <text x="10" y="7">VENDOR</text>
            <rect x="50" y="0" width="40" height="10" rx="2" fill="#f3f4f6" />
            <text x="54" y="7">AMOUNT</text>
            <rect x="94" y="0" width="40" height="10" rx="2" fill="#f3f4f6" />
            <text x="98" y="7">CAT</text>
            <rect x="138" y="0" width="40" height="10" rx="2" fill="#f3f4f6" />
            <text x="142" y="7">CLIENT</text>
          </g>
          {/* rows */}
          {[44, 58, 72, 86].map((y) => (
            <g key={y}>
              <line x1="6" y1={y + 10} x2="178" y2={y + 10} stroke="#e5e7eb" strokeWidth="0.6" />
              <rect x="10" y={y + 2} width="32" height="4" rx="1" fill="#cbd5e1" />
              <rect x="54" y={y + 2} width="22" height="4" rx="1" fill="#cbd5e1" />
              <rect x="98" y={y + 2} width="28" height="4" rx="1" fill="#cbd5e1" />
              <rect x="142" y={y + 2} width="32" height="4" rx="1" fill="#cbd5e1" />
            </g>
          ))}
        </g>
        {/* download arrow badge */}
        <g transform="translate(190 92)">
          <circle r="18" fill="#22c55e" />
          <path d="M0 -8 v12 M-6 -2 l6 6 l6 -6" stroke="#ffffff" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </TileFrame>
    </svg>
  );
}
