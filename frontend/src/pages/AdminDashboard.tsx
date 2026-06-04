import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { 
  ShieldAlert, 
  Users, 
  Upload, 
  FileText, 
  Database, 
  Activity, 
  CreditCard,
  Lock,
  ArrowLeft
} from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from "recharts";
import { Link } from "react-router-dom";

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.role === "Admin") {
      fetchStats();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.admin.getStats();
      setStats(data);
    } catch (e: any) {
      setError(e.message || "Failed to retrieve administrator metrics.");
    } finally {
      setLoading(false);
    }
  };

  // Convert bytes to human readable format
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Restrict access
  if (user?.role !== "Admin") {
    return (
      <div className="p-6 text-center max-w-md mx-auto space-y-6 h-[calc(100vh-10rem)] flex flex-col items-center justify-center">
        <div className="h-14 w-14 rounded-2xl bg-brand-danger/10 border border-brand-danger/20 flex items-center justify-center text-brand-danger">
          <Lock className="h-6 w-6" />
        </div>
        <div className="space-y-2">
          <h2 className="text-base font-extrabold text-brand-text">Admin Credentials Required</h2>
          <p className="text-xs text-brand-muted leading-relaxed">
            Your current account role (`{user?.role || "Guest"}`) does not possess active credentials to review platform metrics.
          </p>
        </div>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-brand-border hover:bg-brand-border/80 border border-brand-border text-xs text-brand-text font-bold transition"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Return to cockpit</span>
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6 text-left space-y-6 animate-pulse">
        <div className="h-6 w-48 bg-brand-border rounded" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-28 bg-brand-card border border-brand-border rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-left">
        <div className="p-4 rounded-xl bg-brand-danger/10 border border-brand-danger/25 text-brand-danger text-sm flex items-center gap-3">
          <ShieldAlert className="h-5 w-5" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  // Formatting chart data for plans
  const planData = [
    { name: "Free Tier", count: stats.revenue_metrics.subscription_tiers["Free Plan"] },
    { name: "Premium Growth", count: stats.revenue_metrics.subscription_tiers["Premium Growth"] }
  ];

  return (
    <div className="p-6 text-left max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-brand-text flex items-center gap-2.5">
          <ShieldAlert className="h-7 w-7 text-brand-danger" />
          <span>Platform Administrator Cockpit</span>
        </h1>
        <p className="text-xs text-brand-muted mt-1 font-medium">
          Monitor system metrics, storage volumes, subscription tiers, and API diagnostics.
        </p>
      </div>

      {/* Stats Counters Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Metric: Total Users */}
        <div className="glass-panel p-6 border-brand-border flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-brand-muted font-bold block uppercase tracking-wider">Registered Accounts</span>
            <span className="text-2xl font-black text-brand-text block">{stats.total_users} Users</span>
          </div>
          <div className="h-10 w-10 rounded-lg bg-brand-cyan/10 border border-brand-cyan/20 flex items-center justify-center text-brand-cyan shadow-cyan-glow">
            <Users className="h-5 w-5" />
          </div>
        </div>

        {/* Metric: Total Datasets */}
        <div className="glass-panel p-6 border-brand-border flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-brand-muted font-bold block uppercase tracking-wider">Ingested Datasets</span>
            <span className="text-2xl font-black text-brand-text block">{stats.total_datasets} Sheets</span>
          </div>
          <div className="h-10 w-10 rounded-lg bg-brand-cyan/10 border border-brand-cyan/20 flex items-center justify-center text-brand-cyan shadow-cyan-glow">
            <Upload className="h-5 w-5" />
          </div>
        </div>

        {/* Metric: Total Reports */}
        <div className="glass-panel p-6 border-brand-border flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-brand-muted font-bold block uppercase tracking-wider">Compiled Reports</span>
            <span className="text-2xl font-black text-brand-text block">{stats.total_reports} Files</span>
          </div>
          <div className="h-10 w-10 rounded-lg bg-brand-cyan/10 border border-brand-cyan/20 flex items-center justify-center text-brand-cyan shadow-cyan-glow">
            <FileText className="h-5 w-5" />
          </div>
        </div>

        {/* Metric: API Hits */}
        <div className="glass-panel p-6 border-brand-border flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-brand-muted font-bold block uppercase tracking-wider">API Advisor Calls</span>
            <span className="text-2xl font-black text-brand-text block">{stats.api_call_count} Requests</span>
          </div>
          <div className="h-10 w-10 rounded-lg bg-brand-cyan/10 border border-brand-cyan/20 flex items-center justify-center text-brand-cyan shadow-cyan-glow">
            <Activity className="h-5 w-5" />
          </div>
        </div>

      </div>

      {/* Row 2: Storage gauge and Subscription chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Storage details */}
        <div className="glass-panel p-6 border-brand-border flex flex-col justify-between h-80">
          <div className="space-y-1">
            <h3 className="text-sm font-extrabold text-brand-text flex items-center gap-2">
              <Database className="h-4.5 w-4.5 text-brand-cyan" />
              <span>Storage Allocation Analysis</span>
            </h3>
            <span className="text-[10px] text-brand-muted block">Disk consumption in reports/ and datasets/ folders.</span>
          </div>
          
          <div className="space-y-4 my-auto">
            <div className="flex justify-between items-baseline">
              <span className="text-2xl font-black text-brand-text">
                {formatBytes(stats.storage_used_bytes)}
              </span>
              <span className="text-xs text-brand-muted">Used of 100 MB quota</span>
            </div>
            
            {/* Progress bar */}
            <div className="h-2.5 w-full bg-brand-border rounded-full overflow-hidden">
              <div 
                className="h-full bg-brand-cyan rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (stats.storage_used_bytes / (1024 * 1024 * 100)) * 100)}%` }}
              />
            </div>
          </div>

          <p className="text-[10px] text-brand-muted leading-relaxed">
            Data includes PostgreSQL schemas metadata, SQLite fallbacks, generated DOCX slides templates, and clean Pandas dataframes caches.
          </p>
        </div>

        {/* Subscription segments chart */}
        <div className="glass-panel p-6 border-brand-border flex flex-col h-80">
          <div className="mb-4">
            <h3 className="text-sm font-extrabold text-brand-text flex items-center gap-2">
              <CreditCard className="h-4.5 w-4.5 text-brand-cyan" />
              <span>SaaS Subscription Metrics</span>
            </h3>
            <span className="text-[10px] text-brand-muted block">Active user tier distributions. MRR: ${stats.revenue_metrics.monthly_recurring_revenue.toLocaleString()}/mo</span>
          </div>

          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={planData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                <XAxis dataKey="name" stroke="#475569" fontSize={10} />
                <YAxis stroke="#475569" fontSize={10} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b" }}
                  itemStyle={{ fontSize: "11px", color: "#f8fafc" }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  <Cell fill="#06b6d4" />
                  <Cell fill="#3b82f6" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
};
