// Tiny plan-tier icons for the pricing section.
// Sized via className — drop at e.g. h-9 w-9.

export function PlanFreeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      {/* small lightning bolt — "starter" energy */}
      <path
        d="M26 6 L12 26 H22 L18 42 L36 22 H26 Z"
        fill="none"
        stroke="#6A3BC8"
        strokeWidth="3"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function PlanProIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      {/* phone + receipt being scanned */}
      <rect x="14" y="10" width="20" height="32" rx="4" fill="none" stroke="#3979EE" strokeWidth="2.6" />
      <rect x="18" y="16" width="12" height="14" rx="1" fill="none" stroke="#28D4E1" strokeWidth="2.4" />
      <line x1="20" y1="20" x2="28" y2="20" stroke="#28D4E1" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="20" y1="24" x2="26" y2="24" stroke="#28D4E1" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="24" cy="37" r="1.6" fill="#3979EE" />
    </svg>
  );
}

export function PlanBusinessIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      {/* three abstract figures — small team */}
      <circle cx="14" cy="18" r="4" fill="none" stroke="#3979EE" strokeWidth="2.6" />
      <path d="M7 36 c0 -6 4 -10 7 -10 s7 4 7 10" fill="none" stroke="#3979EE" strokeWidth="2.6" strokeLinecap="round" />
      <circle cx="24" cy="15" r="5" fill="none" stroke="#3979EE" strokeWidth="2.6" />
      <path d="M16 36 c0 -7 4 -12 8 -12 s8 5 8 12" fill="none" stroke="#3979EE" strokeWidth="2.6" strokeLinecap="round" />
      <circle cx="34" cy="18" r="4" fill="none" stroke="#3979EE" strokeWidth="2.6" />
      <path d="M27 36 c0 -6 4 -10 7 -10 s7 4 7 10" fill="none" stroke="#3979EE" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  );
}
