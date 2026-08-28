import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { PoleSet } from "./PersonalityVisuals";

type ScoreDatum = { name: string; value: number };

const shortLabel = (value: string) => value.length > 16 ? `${value.slice(0, 15)}…` : value;

export function ScoreColumnChart({ data, height = 230 }: { data: ScoreDatum[]; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 22, right: 8, bottom: 36, left: 0 }}>
        <CartesianGrid vertical={false} stroke="var(--color-border)" />
        <XAxis dataKey="name" interval={0} tickFormatter={shortLabel} tick={{ fontSize: 9 }} angle={-20} textAnchor="end" />
        <YAxis domain={[0, 100]} width={28} tick={{ fontSize: 9 }} />
        <Tooltip formatter={(value: number) => `${value}%`} contentStyle={{ fontSize: 12, borderRadius: 6 }} />
        <Bar dataKey="value" radius={[5, 5, 0, 0]} isAnimationActive={false}>
          {data.map((item, index) => <Cell key={item.name} fill={`var(--color-chart-${index % 6 + 1})`} />)}
          <LabelList dataKey="value" position="top" formatter={(value: number) => `${value}%`} style={{ fontSize: 9, fill: "var(--color-foreground)" }} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

const POLE_ROWS = [
  { name: "Energy", left: "E", right: "I", leftLabel: "Outgoing", rightLabel: "Reflective" },
  { name: "Learning", left: "S", right: "N", leftLabel: "Practical", rightLabel: "Innovative" },
  { name: "Decisions", left: "T", right: "F", leftLabel: "Logical", rightLabel: "People-centred" },
  { name: "Planning", left: "J", right: "P", leftLabel: "Structured", rightLabel: "Adaptive" },
] as const;

export function DumbbellChart({ poles }: { poles: PoleSet }) {
  return (
    <div className="space-y-4" role="img" aria-label="Dumbbell chart comparing both sides of each personality dimension">
      {POLE_ROWS.map((row) => {
        const left = poles[row.left];
        const right = poles[row.right];
        const low = Math.min(left, right);
        const high = Math.max(left, right);
        return (
          <div key={row.name} className="grid grid-cols-[84px_1fr] items-center gap-3">
            <span className="text-[11px] font-semibold text-primary">{row.name}</span>
            <div>
              <div className="relative h-6">
                <div className="absolute inset-x-0 top-1/2 h-px bg-border" />
                <div className="absolute top-1/2 h-1 -translate-y-1/2 bg-accent" style={{ left: `${low}%`, width: `${high - low}%` }} />
                <span className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary ring-2 ring-card" style={{ left: `${left}%` }} />
                <span className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent ring-2 ring-card" style={{ left: `${right}%` }} />
              </div>
              <div className="flex justify-between text-[9px] text-muted-foreground">
                <span>{row.leftLabel} {left}%</span><span>{row.rightLabel} {right}%</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function BulletGraph({ data, reference = 50 }: { data: ScoreDatum[]; reference?: number }) {
  return (
    <div className="space-y-3" role="img" aria-label={`Bullet graph with ${reference}% scale midpoint`}>
      {data.map((item) => (
        <div key={item.name} className="grid grid-cols-[118px_1fr_36px] items-center gap-2">
          <span className="truncate text-[10px] font-semibold text-primary">{item.name}</span>
          <div className="relative h-3 bg-secondary">
            <div className="h-full bg-primary" style={{ width: `${item.value}%` }} />
            <div className="absolute inset-y-[-3px] w-0.5 bg-accent" style={{ left: `${reference}%` }} />
          </div>
          <span className="text-right font-mono text-[10px] text-muted-foreground">{item.value}%</span>
        </div>
      ))}
      <p className="text-right text-[9px] text-muted-foreground">Gold marker: 50% scale midpoint</p>
    </div>
  );
}

export function DotPlot({ data }: { data: ScoreDatum[] }) {
  return (
    <div className="space-y-2.5" role="img" aria-label="Dot plot of behavioural scores">
      {data.map((item, index) => (
        <div key={item.name} className="grid grid-cols-[112px_1fr_34px] items-center gap-2">
          <span className="truncate text-[10px] text-primary">{item.name}</span>
          <div className="relative h-4 border-b border-border">
            <span className="absolute bottom-[-5px] h-2.5 w-2.5 -translate-x-1/2 rounded-full" style={{ left: `${item.value}%`, background: `var(--color-chart-${index % 6 + 1})` }} />
          </div>
          <span className="text-right font-mono text-[10px] text-muted-foreground">{item.value}%</span>
        </div>
      ))}
    </div>
  );
}

export function PoleHeatmap({ poles }: { poles: PoleSet }) {
  return (
    <div className="grid grid-cols-4 gap-2" role="img" aria-label="Heatmap of personality preference strengths">
      {POLE_ROWS.flatMap((row) => [
        { key: row.left, label: row.leftLabel, value: poles[row.left] },
        { key: row.right, label: row.rightLabel, value: poles[row.right] },
      ]).map((item) => (
        <div key={item.key} className="min-h-20 border border-border p-2 text-center" style={{ background: `color-mix(in oklab, var(--color-primary) ${Math.max(10, item.value)}%, var(--color-card))` }}>
          <div className="text-lg font-extrabold text-primary-foreground">{item.value}%</div>
          <div className="text-[9px] font-semibold text-primary-foreground">{item.label}</div>
        </div>
      ))}
    </div>
  );
}

export function ContributionWaterfall({ data }: { data: ScoreDatum[] }) {
  const total = data.reduce((sum, item) => sum + item.value, 0) || 1;
  let running = 0;
  const segments = data.map((item) => {
    const start = running;
    running += item.value;
    return { ...item, start: start / total * 100, width: item.value / total * 100 };
  });
  return (
    <div role="img" aria-label="Waterfall chart showing weighted contribution to the overall score">
      <div className="relative h-40 border-b border-l border-border">
        {segments.map((item, index) => (
          <div key={item.name} className="absolute bottom-0 flex items-start justify-center pt-2 text-[9px] font-bold text-primary-foreground" style={{ left: `${item.start}%`, width: `${item.width}%`, height: `${Math.max(18, item.value / total * 250)}%`, background: `var(--color-chart-${index % 6 + 1})` }} title={`${item.name}: ${item.value.toFixed(1)} points`}>
            {item.value.toFixed(1)}
          </div>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
        {data.map((item, index) => <span key={item.name} className="flex items-center gap-1 text-[9px] text-muted-foreground"><span className="h-2 w-2" style={{ background: `var(--color-chart-${index % 6 + 1})` }} />{item.name}</span>)}
      </div>
    </div>
  );
}