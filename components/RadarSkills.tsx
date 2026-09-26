"use client";

import { Legend, PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip } from "recharts";

export interface RadarPoint {
  skill: string;
  current: number;
  required: number;
}

// Shows "you now" vs "role needs" for each skill, on a 0-5 scale.
export default function RadarSkills({ data }: { data: RadarPoint[] }) {
  return (
    <div className="h-80 w-full">
      <ResponsiveContainer>
        <RadarChart data={data} outerRadius="70%">
          <PolarGrid />
          <PolarAngleAxis dataKey="skill" tick={{ fontSize: 11 }} />
          <PolarRadiusAxis domain={[0, 5]} tickCount={6} tick={false} axisLine={false} />
          <Radar name="Role needs" dataKey="required" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.2} />
          <Radar name="You now" dataKey="current" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.45} />
          <Tooltip />
          <Legend />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
