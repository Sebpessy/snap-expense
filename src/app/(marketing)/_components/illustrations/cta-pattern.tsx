// Decorative repeating pattern overlay for the final CTA banner.
export function CTAPattern({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 600 360"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <pattern id="cta-dots" width="32" height="32" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1.4" fill="#ffffff" opacity="0.35" />
        </pattern>
      </defs>
      <rect width="600" height="360" fill="url(#cta-dots)" />
      {/* big soft circles for depth */}
      <circle cx="80" cy="60" r="120" fill="#ffffff" opacity="0.07" />
      <circle cx="520" cy="300" r="160" fill="#ffffff" opacity="0.08" />
      <circle cx="300" cy="180" r="90" fill="#ffffff" opacity="0.05" />
    </svg>
  );
}
