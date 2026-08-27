export function GaugeScore({
  value,
  size = 180,
  label,
  sublabel,
}: {
  value: number; // 0-100
  size?: number;
  label?: string;
  sublabel?: string;
}) {
  const clamped = Math.max(0, Math.min(100, value));
  const radius = 80;
  const circumference = Math.PI * radius;
  const dash = (clamped / 100) * circumference;
  const color =
    clamped >= 75 ? "var(--color-success)" : clamped >= 50 ? "var(--color-accent)" : clamped >= 30 ? "var(--color-warning)" : "var(--color-destructive)";

  return (
    <div className="flex flex-col items-center" style={{ width: size }}>
      <svg viewBox="0 0 200 120" width={size} height={size * 0.6}>
        <path d="M20 100 A80 80 0 0 1 180 100" stroke="var(--color-muted)" strokeWidth="14" fill="none" strokeLinecap="round" />
        <path
          d="M20 100 A80 80 0 0 1 180 100"
          stroke={color}
          strokeWidth="14"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference}`}
          style={{ transition: "stroke-dasharray 800ms ease" }}
        />
        <text x="100" y="85" textAnchor="middle" className="fill-foreground" style={{ fontSize: 28, fontWeight: 800, fontFamily: "var(--font-display)" }}>
          {Math.round(clamped)}<tspan style={{ fontSize: 14 }}>%</tspan>
        </text>
        {label && (
          <text x="100" y="108" textAnchor="middle" className="fill-muted-foreground" style={{ fontSize: 11, fontWeight: 600 }}>
            {label}
          </text>
        )}
      </svg>
      {sublabel && <div className="text-xs text-muted-foreground -mt-2">{sublabel}</div>}
    </div>
  );
}
