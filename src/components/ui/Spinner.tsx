type Size = "sm" | "md" | "lg";

const sizeMap: Record<Size, number> = {
  sm: 12,
  md: 16,
  lg: 24,
};

export function Spinner({
  size = "md",
  color = "currentColor",
  className = "",
}: {
  size?: Size;
  color?: string;
  className?: string;
}) {
  const px = sizeMap[size];
  return (
    <svg
      width={px}
      height={px}
      viewBox="0 0 24 24"
      fill="none"
      className={`animate-spin ${className}`}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" stroke={color} strokeOpacity="0.18" strokeWidth="2" />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
