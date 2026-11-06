import { CartesianGrid, Line, LineChart, PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useChartColors } from "../hooks/useChartColors";
import { formatShortDate } from "../lib/utils";

export function SkillRadar({ data, height = 280 }: { data: { skill: string; value: number }[]; height?: number }) {
  const c = useChartColors();
  return (
    <div style={{ height }} role="img" aria-label={"Skill radar: " + data.map((d) => `${d.skill} ${d.value}`).join(", ")}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius="72%">
          <PolarGrid stroke={c.line} />
          <PolarAngleAxis dataKey="skill" tick={{ fill: c.muted, fontSize: 12 }} />
          <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
          <Radar dataKey="value" stroke={c.primary} fill={c.primary} fillOpacity={0.22} strokeWidth={2.25} />
          <Tooltip contentStyle={{ background: c.surface, border: `1px solid ${c.line}`, borderRadius: 10, color: c.ink, fontSize: 13 }} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ScoreTrend({ data, height = 240 }: { data: { date: string; score: number; readiness: number }[]; height?: number }) {
  const c = useChartColors();
  return (
    <div style={{ height }} role="img" aria-label="Interview scores over time">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
          <CartesianGrid vertical={false} stroke={c.line} strokeDasharray="3 4" />
          <XAxis dataKey="date" tickFormatter={formatShortDate} tickLine={false} axisLine={false} minTickGap={24} tick={{ fill: c.muted, fontSize: 12 }} />
          <YAxis domain={[0, 100]} tickLine={false} axisLine={false} width={44} tick={{ fill: c.muted, fontSize: 12 }} />
          <Tooltip
            contentStyle={{ background: c.surface, border: `1px solid ${c.line}`, borderRadius: 10, color: c.ink, fontSize: 13 }}
            labelFormatter={(l) => formatShortDate(String(l))}
          />
          <Line type="monotone" dataKey="score" name="Score" stroke={c.primary} strokeWidth={2.5} dot={{ r: 3.5, fill: c.primary, strokeWidth: 0 }} activeDot={{ r: 5 }} />
          <Line type="monotone" dataKey="readiness" name="Readiness" stroke={c.accent} strokeWidth={2} strokeDasharray="5 4" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
