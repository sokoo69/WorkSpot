"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { LayoutDashboard, TrendingUp, Calendar, Building2, ShieldCheck, Users } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { AdminOverviewTab } from "./AdminOverviewTab";
import { AdminUsersTab } from "./AdminUsersTab";
import { AdminSpacesTab } from "./AdminSpacesTab";
import { BookingRequestsSection } from "./BookingRequestsSection";
import { CsvExport } from "./CsvExport";
import { KYCSection } from "./KYCSection";
import { AdminVerificationTab } from "./AdminVerificationTab";
import { ProfileSection } from "./ProfileSection";

export function DashboardClient({ role, session }: { role: string, session?: any }) {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "spaces" | "verification">("overview");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await fetch("/api/dashboard");
        if (res.ok) {
          const result = await res.json();
          setData(result.data);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-6xl animate-pulse">
        <div className="h-10 w-48 bg-[var(--line)]/50 rounded mb-8"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[1, 2, 3].map(i => <div key={i} className="h-32 bg-[var(--line)]/50 rounded-md"></div>)}
        </div>
        <div className="h-96 bg-[var(--line)]/50 rounded-md mb-8"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-[var(--rust)] mb-4">Error loading dashboard</h2>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="font-display font-bold text-3xl md:text-4xl text-[var(--ink)] mb-2 flex items-center gap-3">
            <LayoutDashboard className="w-8 h-8 text-[var(--forest)]" />
            Dashboard
          </h1>
          <p className="text-[var(--ink)]/70">Overview of your spaces and earnings.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/spaces/manage">
            <Button variant="outline">Manage Spaces</Button>
          </Link>
          <Link href="/spaces/add">
            <Button>Add New Space</Button>
          </Link>
        </div>
      </div>
      
      {/* Personal Metrics Cards */}
      <h2 className="font-bold text-xl text-[var(--ink)] mb-4 border-b border-[var(--line)] pb-2">Your Activity</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-[var(--base)] border border-[var(--line)] p-6 rounded-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-[var(--ink)]/70 uppercase text-xs tracking-wider">Total Earnings</h3>
            <div className="w-8 h-8 rounded-full bg-[var(--forest)]/10 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-[var(--forest)]" />
            </div>
          </div>
          <div className="font-mono font-bold text-3xl text-[var(--ink)]">
            {data.metrics.totalRevenue.toLocaleString()} <span className="text-sm text-[var(--ink)]/50">BDT</span>
          </div>
        </div>

        <div className="bg-[var(--base)] border border-[var(--line)] p-6 rounded-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-[var(--ink)]/70 uppercase text-xs tracking-wider">Upcoming Bookings</h3>
            <div className="w-8 h-8 rounded-full bg-[var(--forest)]/10 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-[var(--forest)]" />
            </div>
          </div>
          <div className="font-display font-bold text-3xl text-[var(--ink)]">
            {data.metrics.upcomingBookings}
          </div>
        </div>

        <div className="bg-[var(--base)] border border-[var(--line)] p-6 rounded-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-[var(--ink)]/70 uppercase text-xs tracking-wider">Active Listings</h3>
            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
              <Building2 className="w-4 h-4 text-purple-600" />
            </div>
          </div>
          <div className="font-display font-bold text-3xl text-[var(--ink)]">
            {data.metrics.totalSpaces}
          </div>
        </div>
      </div>
      
      {session && <ProfileSection session={session} />}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {/* Chart */}
        <div className="lg:col-span-2 bg-[var(--base)] border border-[var(--line)] p-6 rounded-md">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-lg text-[var(--ink)]">Revenue Over Time (6 Months)</h3>
            <CsvExport data={data.rawBookings || []} filename="revenue_export" />
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.chartData}>
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
                  tickFormatter={(value) => `${value / 1000}k`}
                  dx={-10}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                  contentStyle={{ backgroundColor: 'var(--ink)', color: 'var(--base)', borderRadius: '4px', border: 'none' }}
                  itemStyle={{ color: 'var(--base)' }}
                  formatter={(value: any) => [`${value} BDT`, 'Revenue']}
                />
                <Bar dataKey="revenue" fill="var(--forest)" radius={[4, 4, 0, 0]} maxBarSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="bg-[var(--base)] border border-[var(--line)] p-6 rounded-md">
          <h3 className="font-bold text-lg text-[var(--ink)] mb-6">Recent Bookings</h3>
          {data.recentBookings.length === 0 ? (
            <p className="text-[var(--ink)]/60 text-sm">No recent bookings found.</p>
          ) : (
            <div className="space-y-4">
              {data.recentBookings.map((booking: any) => (
                <div key={booking.id} className="flex justify-between items-start pb-4 border-b border-[var(--line)] last:border-0 last:pb-0">
                  <div>
                    <h4 className="font-bold text-sm text-[var(--ink)] line-clamp-1">{booking.spaceName}</h4>
                    <p className="text-xs text-[var(--ink)]/70 mt-1">{booking.date} | {booking.time}</p>
                    <div className="mt-2">
                      <Badge variant={booking.status === "cancelled" ? "destructive" : "default"}>
                        {booking.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="font-mono font-bold text-sm text-[var(--ink)]">
                    +{booking.amount}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Booking Requests (For space owners) */}
      {data.metrics.totalSpaces > 0 && (
        <BookingRequestsSection />
      )}

      {/* KYC Verification (For non-admins) */}
      {role !== "admin" && (
        <KYCSection />
      )}

      {/* Admin Controls Section */}
      {role === "admin" && (
        <div className="mt-16 pt-8 border-t-2 border-[var(--line)]">
          <h2 className="font-display font-bold text-2xl text-[var(--ink)] mb-6 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-[var(--clay)]" />
            Platform Administration
          </h2>
          
          <div className="flex gap-2 mb-6 border-b border-[var(--line)] overflow-x-auto pb-1 scrollbar-hide">
            <button 
              onClick={() => setActiveTab("overview")}
              className={`px-4 py-2 font-bold text-sm uppercase tracking-wider border-b-2 transition-colors shrink-0 ${
                activeTab === "overview" ? "border-[var(--forest)] text-[var(--forest)]" : "border-transparent text-[var(--ink)]/50 hover:text-[var(--ink)]"
              }`}
            >
              Overview
            </button>
            <button 
              onClick={() => setActiveTab("users")}
              className={`px-4 py-2 font-bold text-sm uppercase tracking-wider border-b-2 transition-colors flex items-center gap-2 shrink-0 ${
                activeTab === "users" ? "border-[var(--forest)] text-[var(--forest)]" : "border-transparent text-[var(--ink)]/50 hover:text-[var(--ink)]"
              }`}
            >
              <Users className="w-4 h-4" /> All Users
            </button>
            <button 
              onClick={() => setActiveTab("spaces")}
              className={`px-4 py-2 font-bold text-sm uppercase tracking-wider border-b-2 transition-colors flex items-center gap-2 shrink-0 ${
                activeTab === "spaces" ? "border-[var(--forest)] text-[var(--forest)]" : "border-transparent text-[var(--ink)]/50 hover:text-[var(--ink)]"
              }`}
            >
              <Building2 className="w-4 h-4" /> All Spaces
            </button>
            <button 
              onClick={() => setActiveTab("verification")}
              className={`px-4 py-2 font-bold text-sm uppercase tracking-wider border-b-2 transition-colors flex items-center gap-2 shrink-0 ${
                activeTab === "verification" ? "border-[var(--forest)] text-[var(--forest)]" : "border-transparent text-[var(--ink)]/50 hover:text-[var(--ink)]"
              }`}
            >
              <ShieldCheck className="w-4 h-4" /> Verification Requests
            </button>
          </div>

          <div className="min-h-[400px]">
            {activeTab === "overview" && <AdminOverviewTab />}
            {activeTab === "users" && <AdminUsersTab />}
            {activeTab === "spaces" && <AdminSpacesTab />}
            {activeTab === "verification" && <AdminVerificationTab />}
          </div>
        </div>
      )}
    </div>
  );
}
