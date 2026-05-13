import Image from "next/image";

export function Logo({
  size = 32,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <Image
      src="/icon-source.png"
      alt="Snap Expense"
      width={size}
      height={size}
      className={className}
      priority
    />
  );
}
