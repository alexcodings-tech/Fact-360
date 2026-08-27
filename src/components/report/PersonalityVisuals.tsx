import {
  PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip,
} from "recharts";

/** ---------- data helpers (all values derived from the real answers) ---------- */

export type DimScores = {
  EI?: { ePct?: number; leader?: string };
  SN?: { sPct?: number; leader?: string };
  TF?: { tPct?: number; leader?: string };
  JP?: { jPct?: number; leader?: string };
};

export type PoleSet = {
  E: number; I: number; S: number; N: number; T: number; F: number; J: number; P: number;
};

export function toPoles(dim: DimScores | undefined | null): PoleSet | null {
  if (!dim) return null;
  const e = dim.EI?.ePct, s = dim.SN?.sPct, t = dim.TF?.tPct, j = dim.JP?.jPct;
  if ([e, s, t, j].some((v) => typeof v !== "number")) return null;
  return {
    E: e as number, I: 100 - (e as number),
    S: s as number, N: 100 - (s as number),
    T: t as number, F: 100 - (t as number),
    J: j as number, P: 100 - (j as number),
  };
}

export const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

export function behaviourMetrics(p: PoleSet) {
  return [
    { label: "Communication", value: clamp(p.E * 0.6 + p.F * 0.4) },
    { label: "Decision Making", value: clamp(p.T * 0.5 + p.J * 0.5) },
    { label: "Teamwork", value: clamp(p.E * 0.5 + p.F * 0.5) },
    { label: "Problem Solving", value: clamp(p.N * 0.5 + p.T * 0.5) },
    { label: "Work Approach", value: clamp(p.J * 0.7 + p.S * 0.3) },
    { label: "Adaptability", value: clamp(p.P * 0.7 + p.N * 0.3) },
    { label: "Leadership Tendency", value: clamp((p.E + p.T + p.J) / 3) },
  ];
}

export function temperamentSplit(p: PoleSet) {
  const raw = [
    { name: "SJ — Structured", value: (p.S + p.J) / 2 },
    { name: "SP — Practical", value: (p.S + p.P) / 2 },
    { name: "NT — Analytical", value: (p.N + p.T) / 2 },
    { name: "NF — People-focused", value: (p.N + p.F) / 2 },
  ];
  const total = raw.reduce((a, b) => a + b.value, 0) || 1;
  return raw.map((r) => ({ name: r.name, value: Math.round((r.value / total) * 100) }));
}

export const bandLabel = (v: number) => (v >= 70 ? "High" : v >= 50 ? "Moderate" : "Developing");

/** ---------- visuals ---------- */

const DIM_ROWS = [
  { left: "Extraversion", right: "Introversion", lk: "E", rk: "I" },
  { left: "Sensing", right: "iNtuition", lk: "S", rk: "N" },
  { left: "Thinking", right: "Feeling", lk: "T", rk: "F" },
  { left: "Judging", right: "Perceiving", lk: "J", rk: "P" },
] as const;

/** Diverging preference chart (mirrors the classic preference-strength bar chart). */
export function PreferenceBars({ poles }: { poles: PoleSet }) {
  return (
    <div>
      <div className="flex items-center justify-center gap-5 text-[11px] font-semibold text-primary mb-3">
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm bg-primary" /> Stronger</span>
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm bg-accent" /> Weaker</span>
      </div>
      <div className="space-y-2.5">
        {DIM_ROWS.map((d) => {
          const l = poles[d.lk as keyof PoleSet];
          const r = poles[d.rk as keyof PoleSet];
          const leftStronger = l >= r;
          return (
            <div key={d.lk} className="grid grid-cols-[92px_1fr_92px] items-center gap-2">
              <div className="text-[11px] font-semibold text-primary text-right">{d.left}</div>
              <div className="relative h-7">
                <div className="absolute inset-0 grid grid-cols-8">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="border-l border-border/60 first:border-l-0" />
                  ))}
                </div>
                <div className="absolute inset-y-0 left-1/2 w-px bg-primary" />
                {/* left half */}
                <div className="absolute inset-y-0 right-1/2 flex justify-end">
                  <div
                    className={`h-full flex items-center justify-center text-[10px] font-bold ${leftStronger ? "bg-primary text-primary-foreground" : "bg-accent text-accent-foreground"}`}
                    style={{ width: `${l}%` }}
                  >
                    {l}%
                  </div>
                </div>
                {/* right half */}
                <div className="absolute inset-y-0 left-1/2 flex">
                  <div
                    className={`h-full flex items-center justify-center text-[10px] font-bold ${!leftStronger ? "bg-primary text-primary-foreground" : "bg-accent text-accent-foreground"}`}
                    style={{ width: `${r}%` }}
                  >
                    {r}%
                  </div>
                </div>
              </div>
              <div className="text-[11px] font-semibold text-primary">{d.right}</div>
            </div>
          );
        })}
      </div>
      <div className="mt-2 grid grid-cols-[92px_1fr_92px] gap-2 text-[9px] text-muted-foreground">
        <span />
        <div className="flex justify-between"><span>100%</span><span>50%</span><span>0%</span><span>50%</span><span>100%</span></div>
        <span />
      </div>
      <p className="mt-3 text-center text-xs text-muted-foreground">Strength of your preferences</p>
    </div>
  );
}

const DONUT_COLORS = ["var(--color-primary)", "var(--color-accent)", "#5b6b8c", "#c9d2e3"];

export function TemperamentDonut({ poles, height = 220 }: { poles: PoleSet; height?: number }) {
  const data = temperamentSplit(poles);
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius="45%" outerRadius="78%" paddingAngle={2}>
          {data.map((_, i) => <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />)}
        </Pie>
        <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle"
          wrapperStyle={{ fontSize: 11 }} formatter={(v: any, e: any) => `${v} (${e?.payload?.value}%)`} />
        <Tooltip formatter={(v: any) => `${v}%`} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function MeterRow({ label, value, note, tone = "primary" }: { label: string; value: number; note?: string; tone?: "primary" | "accent" | "rose" }) {
  const bg = tone === "accent" ? "bg-accent" : tone === "rose" ? "bg-rose-500" : "bg-primary";
  return (
    <div>
      <div className="flex items-baseline justify-between text-xs">
        <span className="font-semibold text-primary">{label}</span>
        <span className="font-mono font-semibold text-muted-foreground">{value}% · {note ?? bandLabel(value)}</span>
      </div>
      <div className="mt-1 h-2.5 rounded-full bg-secondary overflow-hidden">
        <div className={`h-full rounded-full ${bg}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

export function DimensionRing({ label, value, pole }: { label: string; value: number; pole: string }) {
  const deg = (value / 100) * 360;
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div
        className="h-20 w-20 rounded-full grid place-items-center"
        style={{ background: `conic-gradient(var(--color-accent) ${deg}deg, var(--color-secondary) ${deg}deg)` }}
      >
        <div className="h-14 w-14 rounded-full bg-card grid place-items-center">
          <span className="text-base font-extrabold text-primary leading-none">{pole}</span>
          <span className="text-[10px] text-muted-foreground">{value}%</span>
        </div>
      </div>
      <span className="text-[10px] font-semibold text-primary text-center leading-tight">{label}</span>
    </div>
  );
}
