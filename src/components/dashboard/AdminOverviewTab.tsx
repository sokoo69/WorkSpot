"use client";

import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { Users, Building2, CalendarCheck, DollarSign } from "lucide-react";

const COLORS = ['#2C4A3B', '#41735B', '#EAE6E1', '#8C9A9E'];

export function AdminOverviewTab() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const statsRes = await fetch("/api/admin/stats");
        if (statsRes.ok) {
          const statsResult = await statsRes.json();
          setData(statsResult.data);
        }
      } catch (error) {
        console.error("Failed to fetch admin data", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAdminData();
  }, []);

  if (isLoading) {
    return <div className="py-12 text-center text-[var(--ink)]/50">Loading Admin Overview...</div>;
  }

  if (!data) {
    return <div className="py-12 text-center text-[var(--rust)]">Failed to load admin overview</div>;
  }

  return (
    <div className="py-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="bg-[var(--base)] border border-[var(--line)] p-6 rounded-md">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-5 h-5 text-[var(--ink)]/50" />
            <h3 className="font-bold text-[var(--ink)]/70 uppercase text-xs tracking-wider">Total Users</h3>
          </div>
          <div className="font-display font-bold text-3xl text-[var(--ink)]">{data.metrics.users}</div>
        </div>

        <div className="bg-[var(--base)] border border-[var(--line)] p-6 rounded-md">
          <div className="flex items-center gap-3 mb-2">
            <Building2 className="w-5 h-5 text-[var(--ink)]/50" />
            <h3 className="font-bold text-[var(--ink)]/70 uppercase text-xs tracking-wider">Total Spaces</h3>
          </div>
          <div className="font-display font-bold text-3xl text-[var(--ink)]">{data.metrics.spaces}</div>
        </div>

        <div className="bg-[var(--base)] border border-[var(--line)] p-6 rounded-md">
          <div className="flex items-center gap-3 mb-2">
            <CalendarCheck className="w-5 h-5 text-[var(--ink)]/50" />
            <h3 className="font-bold text-[var(--ink)]/70 uppercase text-xs tracking-wider">Total Bookings</h3>
          </div>
          <div className="font-display font-bold text-3xl text-[var(--ink)]">{data.metrics.bookings}</div>
        </div>

        <div className="bg-[var(--base)] border border-[var(--line)] p-6 rounded-md">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="w-5 h-5 text-[var(--ink)]/50" />
            <h3 className="font-bold text-[var(--ink)]/70 uppercase text-xs tracking-wider">Total Revenue</h3>
          </div>
          <div className="font-mono font-bold text-3xl text-[var(--ink)]">
            {data.metrics.revenue.toLocaleString()}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-[var(--base)] border border-[var(--line)] p-6 rounded-md">
          <h3 className="font-bold text-lg text-[var(--ink)] mb-6">Space Categories</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.categoryData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[var(--base)] border border-[var(--line)] p-6 rounded-md">
          <h3 className="font-bold text-lg text-[var(--ink)] mb-6">Platform Growth</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.growthData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--line)" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'var(--ink)', fontSize: 12 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'var(--ink)', fontSize: 12 }}
                  dx={-10}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                  contentStyle={{ backgroundColor: 'var(--ink)', color: 'var(--base)', borderRadius: '4px', border: 'none' }}
                  itemStyle={{ color: 'var(--base)' }}
                />
                <Legend />
                <Bar dataKey="users" fill="#8C9A9E" name="New Users" radius={[4, 4, 0, 0]} maxBarSize={30} />
                <Bar dataKey="bookings" fill="var(--forest)" name="New Bookings" radius={[4, 4, 0, 0]} maxBarSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
