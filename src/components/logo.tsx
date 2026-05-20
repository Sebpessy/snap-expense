import Image from "next/image";

type Variant = "mark" | "icon" | "wordmark";

const SRC: Record<Variant, { src: string; w: number; h: number }> = {
  // Transparent X mark — use anywhere there's already text or context.
  mark: { src: "/xpenz-mark.png", w: 512, h: 512 },
  // White rounded-square app-icon look — use as a tile / standalone badge.
  icon: { src: "/xpenz-app-icon.png", w: 1254, h: 1254 },
  // X + XPENZ stacked wordmark — use as a hero / standalone brand block.
  wordmark: { src: "/xpenz-wordmark.png", w: 1024, h: 1024 },
};

export function Logo({
  size = 32,
  className,
  variant = "mark",
}: {
  size?: number;
  className?: string;
  variant?: Variant;
}) {
  const { src, w, h } = SRC[variant];
  const ratio = h / w;
  return (
    <Image
      src={src}
      alt="Xpenz"
      width={size}
      height={Math.round(size * ratio)}
      className={className}
      priority
    />
  );
}
