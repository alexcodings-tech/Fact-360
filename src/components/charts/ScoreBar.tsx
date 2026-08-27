export function ScoreBar({ label, value, max = 100, color }: { label: string; value: number; max?: number; color?: string }) {
  const pct = Math.min(100, (value / max) * 100);
  const c = color ?? (pct >= 70 ? "var(--color-success)" : pct >= 50 ? "var(--color-accent)" : pct >= 30 ? "var(--color-warning)" : "var(--color-destructive)");
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="font-medium text-foreground">{label}</span>
        <span className="font-mono font-semibold text-foreground">{value}{max === 100 ? "%" : `/${max}`}</span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div className="h-full rounded-full transition-[width] duration-700" style={{ width: `${pct}%`, background: c }} />
      </div>
    </div>
  );
}
