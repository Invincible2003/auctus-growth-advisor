import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { 
  TrendingUp, 
  Users, 
  ShoppingBag, 
  DollarSign, 
  Activity, 
  AlertCircle,
  Activity as GaugeIcon
} from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, BarChart, Bar } from "recharts";

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.analytics.getDashboard();
      setData(res);
    } catch (e: any) {
      setError(e.message || "Failed to load dashboard metrics.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6 text-left animate-pulse-slow">
        {/* KPI Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-brand-card border border-brand-border rounded-xl p-6 space-y-3">
              <div className="h-4 w-24 bg-brand-border rounded" />
              <div className="h-8 w-32 bg-brand-border rounded" />
            </div>
          ))}
        </div>
        {/* Charts Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-80 bg-brand-card border border-brand-border rounded-xl p-6" />
          <div className="h-80 bg-brand-card border border-brand-border rounded-xl p-6" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="p-4 rounded-xl bg-brand-danger/10 border border-brand-danger/25 text-brand-danger text-sm flex items-center gap-3">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  const { kpis, sales_trends, category_distribution, regional_sales, recent_activity } = data;

  // Colors for Pie Chart
  const COLORS = ["#06b6d4", "#3b82f6", "#f59e0b", "#10b981", "#ef4444"];

  // Gauge rating color mapping
  const getGaugeColor = (rating: string) => {
    switch (rating) {
      case "Excellent": return "text-brand-success border-brand-success/30 bg-brand-success/5";
      case "Good": return "text-brand-cyan border-brand-cyan/30 bg-brand-cyan/5";
      case "Average": return "text-brand-warning border-brand-warning/30 bg-brand-warning/5";
      default: return "text-brand-danger border-brand-danger/30 bg-brand-danger/5";
    }
  };

  return (
    <div className="p-6 space-y-6 text-left max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-brand-text">Business Intelligence Cockpit</h1>
          <p className="text-xs text-brand-muted mt-1 font-medium">
            Welcome back. Here is your current business growth diagnostics summary.
          </p>
        </div>
        {!kpis.has_real_data && (
          <div className="px-3 py-1.5 rounded-lg bg-brand-warning/10 border border-brand-warning/20 text-[10px] text-brand-warning font-semibold flex items-center gap-1.5">
            <AlertCircle className="h-4 w-4" />
            <span>Demonstration Sandbox (No custom sales sheets uploaded yet)</span>
          </div>
        )}
      </div>

      {/* KPI Counters Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* KPI: Total Revenue */}
        <div className="glass-panel p-6 border-brand-border flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-brand-muted font-bold block uppercase tracking-wider">Total Revenue</span>
            <span className="text-2xl font-black text-brand-text block">${kpis.total_revenue.toLocaleString()}</span>
          </div>
          <div className="h-10 w-10 rounded-lg bg-brand-cyan/10 border border-brand-cyan/20 flex items-center justify-center text-brand-cyan shadow-cyan-glow">
            <DollarSign className="h-5 w-5" />
          </div>
        </div>

        {/* KPI: Growth Rate */}
        <div className="glass-panel p-6 border-brand-border flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-brand-muted font-bold block uppercase tracking-wider">Monthly Growth</span>
            <span className="text-2xl font-black text-brand-text block">
              {kpis.monthly_growth_percent > 0 ? "+" : ""}{kpis.monthly_growth_percent}%
            </span>
          </div>
          <div className="h-10 w-10 rounded-lg bg-brand-blue/10 border border-brand-blue/20 flex items-center justify-center text-brand-blue">
            <TrendingUp className="h-5 w-5" />
          </div>
        </div>

        {/* KPI: Customer Count */}
        <div className="glass-panel p-6 border-brand-border flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-brand-muted font-bold block uppercase tracking-wider">Customer Count</span>
            <span className="text-2xl font-black text-brand-text block">{kpis.customer_count}</span>
          </div>
          <div className="h-10 w-10 rounded-lg bg-brand-cyan/10 border border-brand-cyan/20 flex items-center justify-center text-brand-cyan shadow-cyan-glow">
            <Users className="h-5 w-5" />
          </div>
        </div>

        {/* KPI: Best Seller */}
        <div className="glass-panel p-6 border-brand-border flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-brand-muted font-bold block uppercase tracking-wider">Top Product SKU</span>
            <span className="text-sm font-extrabold text-brand-text block truncate max-w-[150px]">{kpis.best_selling_product}</span>
          </div>
          <div className="h-10 w-10 rounded-lg bg-brand-cyan/10 border border-brand-cyan/20 flex items-center justify-center text-brand-cyan shadow-cyan-glow">
            <ShoppingBag className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Row 2: Sales Line Plot & Health Gauge */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Line Plot */}
        <div className="lg:col-span-2 glass-panel p-6 border-brand-border flex flex-col h-96">
          <div className="mb-4">
            <h3 className="text-sm font-extrabold text-brand-text block">Sales Trend Timeline</h3>
            <span className="text-[10px] text-brand-muted block mt-0.5">Historical daily revenue tracking.</span>
          </div>
          
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sales_trends} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#475569" fontSize={9} />
                <YAxis stroke="#475569" fontSize={9} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b" }}
                  labelStyle={{ color: "#94a3b8", fontSize: "10px" }}
                  itemStyle={{ fontSize: "12px", color: "#f8fafc" }}
                />
                <Line type="monotone" dataKey="revenue" stroke="#06b6d4" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Business Health Score Gauge */}
        <div className="glass-panel p-6 border-brand-border flex flex-col items-center justify-between h-96">
          <div className="text-left w-full">
            <h3 className="text-sm font-extrabold text-brand-text block">Business Health Score</h3>
            <span className="text-[10px] text-brand-muted block mt-0.5">Weighted composite rating.</span>
          </div>

          {/* Gauge Visualization */}
          <div className="relative flex items-center justify-center mt-4">
            {/* Colored arc outline */}
            <svg className="w-40 h-40">
              <circle
                cx="80"
                cy="80"
                r="64"
                stroke="#1e293b"
                strokeWidth="10"
                fill="transparent"
              />
              <circle
                cx="80"
                cy="80"
                r="64"
                stroke="#06b6d4"
                strokeWidth="10"
                fill="transparent"
                strokeDasharray="402"
                strokeDashoffset={402 - (402 * kpis.health_score) / 100}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
                transform="rotate(-90 80 80)"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-4xl font-black text-brand-text">{kpis.health_score}</span>
              <span className="text-[10px] text-brand-muted font-bold block uppercase tracking-wide">out of 100</span>
            </div>
          </div>

          <div className={`w-full py-2.5 rounded-lg border text-center font-bold text-xs capitalize ${getGaugeColor(kpis.health_rating)}`}>
            Rating Category: {kpis.health_rating}
          </div>
        </div>
      </div>

      {/* Row 3: Categories Pie split, Regional Bar graph, and Activity Logs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Categories Pie */}
        <div className="glass-panel p-6 border-brand-border flex flex-col h-80">
          <div className="mb-4">
            <h3 className="text-xs font-extrabold text-brand-text block uppercase tracking-wider">Product Categories</h3>
            <span className="text-[10px] text-brand-muted block mt-0.5">Share of sales revenue.</span>
          </div>
          
          <div className="flex-1 w-full relative flex items-center justify-center">
            {category_distribution.length === 0 ? (
              <div className="text-xs text-brand-muted">No category data.</div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip
                      contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b" }}
                      itemStyle={{ fontSize: "11px", color: "#f8fafc" }}
                    />
                    <Pie
                      data={category_distribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {category_distribution.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                {/* Custom Legend */}
                <div className="absolute bottom-0 flex flex-wrap justify-center gap-x-3 gap-y-1 text-[9px] text-brand-muted max-w-[200px]">
                  {category_distribution.map((entry: any, index: number) => (
                    <div key={entry.name} className="flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                      <span>{entry.name} ({entry.value}%)</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Regions Bar Graph */}
        <div className="glass-panel p-6 border-brand-border flex flex-col h-80">
          <div className="mb-4">
            <h3 className="text-xs font-extrabold text-brand-text block uppercase tracking-wider">Regional Revenue</h3>
            <span className="text-[10px] text-brand-muted block mt-0.5">Sales performance per sector.</span>
          </div>
          
          <div className="flex-1 w-full">
            {regional_sales.length === 0 ? (
              <div className="text-xs text-brand-muted flex items-center justify-center h-full">No regional data.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={regional_sales} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="region" stroke="#475569" fontSize={9} />
                  <YAxis stroke="#475569" fontSize={9} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b" }}
                    itemStyle={{ fontSize: "11px", color: "#f8fafc" }}
                  />
                  <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Audit / Activity Logs */}
        <div className="glass-panel p-6 border-brand-border flex flex-col h-80 md:col-span-2 lg:col-span-1">
          <div className="mb-4">
            <h3 className="text-xs font-extrabold text-brand-text block uppercase tracking-wider">System Operations Log</h3>
            <span className="text-[10px] text-brand-muted block mt-0.5">Recent audit events.</span>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-3.5 pr-1">
            {recent_activity.map((act: any, idx: number) => (
              <div key={idx} className="flex gap-3 text-left">
                <div className="h-7 w-7 rounded bg-brand-border flex items-center justify-center text-brand-cyan shrink-0">
                  <Activity className="h-3.5 w-3.5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-brand-text">{act.event}</span>
                    <span className="text-[8px] text-brand-muted">{act.time}</span>
                  </div>
                  <p className="text-[10px] text-brand-muted mt-0.5 leading-snug">{act.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
