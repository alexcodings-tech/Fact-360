import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

export type RadarPoint = { area: string; value: number; fullMark?: number };

export function RadarScore({
  data,
  height = 320,
  color = "var(--color-accent)",
}: {
  data: RadarPoint[];
  height?: number;
  color?: string;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RadarChart data={data} outerRadius="75%">
        <PolarGrid stroke="var(--color-border)" />
        <PolarAngleAxis
          dataKey="area"
          tick={{ fill: "var(--color-foreground)", fontSize: 11, fontWeight: 600 }}
        />
        <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: "var(--color-muted-foreground)", fontSize: 10 }} />
        <Radar
          name="Score"
          dataKey="value"
          stroke={color}
          fill={color}
          fillOpacity={0.35}
          strokeWidth={2}
        />
        <Tooltip
          contentStyle={{
            background: "var(--color-card)",
            border: "1px solid var(--color-border)",
            borderRadius: 8,
            fontSize: 12,
          }}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
