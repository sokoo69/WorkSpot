"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

export function RatingBreakdown({ reviews }: { reviews: any[] }) {
  if (!reviews || reviews.length === 0) return null;

  const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach(r => {
    if (r.rating >= 1 && r.rating <= 5) counts[r.rating as keyof typeof counts]++;
  });

  const data = [
    { name: "5★", count: counts[5] },
    { name: "4★", count: counts[4] },
    { name: "3★", count: counts[3] },
    { name: "2★", count: counts[2] },
    { name: "1★", count: counts[1] },
  ];

  return (
    <div className="bg-[var(--base)] p-4 rounded-md border border-[var(--line)] mb-6">
      <h3 className="text-sm font-bold text-[var(--ink)] mb-4">Rating Breakdown</h3>
      <div className="h-40 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
          >
            <XAxis type="number" hide />
            <YAxis 
              dataKey="name" 
              type="category" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: 'var(--ink)', fontSize: 12 }} 
              width={30}
            />
            <Tooltip 
              cursor={{ fill: 'var(--line)', opacity: 0.2 }}
              contentStyle={{ backgroundColor: 'var(--base)', borderColor: 'var(--line)', fontSize: '12px' }}
            />
            <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={12}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill="var(--forest)" />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
