import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { 
  Users, 
  UserCheck, 
  AlertCircle, 
  HelpCircle,
  TrendingDown,
  Mail,
  UserX,
  Sparkles
} from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";

export const CustomerSegments: React.FC = () => {
  const [segments, setSegments] = useState<any[]>([]);
  const [summary, setSummary] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await api.analytics.getCustomers();
      setSegments(res.customer_segments);
      setSummary(res.segment_summary);
    } catch (e: any) {
      setError(e.message || "Failed to compile customer clustering.");
    } finally {
      setLoading(false);
    }
  };

  const getPersonaIcon = (name: string) => {
    if (name.includes("Champions")) return <UserCheck className="h-5 w-5" />;
    if (name.includes("Risk") || name.includes("Sleepers")) return <UserX className="h-5 w-5" />;
    return <Users className="h-5 w-5" />;
  };

  return (
    <div className="p-6 text-left max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-brand-text">Customer Trend & Segments</h1>
        <p className="text-xs text-brand-muted mt-1 font-medium">
          Uses unsupervised KMeans clustering on RFM metrics to group customer personas.
        </p>
      </div>

      {loading ? (
        <div className="space-y-6 animate-pulse-slow">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-44 bg-brand-card border border-brand-border rounded-xl" />
            ))}
          </div>
          <div className="h-80 bg-brand-card border border-brand-border rounded-xl" />
        </div>
      ) : error ? (
        <div className="p-4 rounded-xl bg-brand-danger/10 border border-brand-danger/25 text-brand-danger text-sm flex items-center gap-3">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      ) : (
        <div className="space-y-6 animate-fade-in">
          
          {/* Persona Cards Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {summary.map((seg, idx) => (
              <div
                key={idx}
                className="glass-panel p-6 border-brand-border flex flex-col justify-between space-y-4 hover:shadow-cyan-glow transition duration-300"
                style={{ borderTop: `4px solid ${seg.color}` }}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="p-2 rounded-lg bg-brand-border/40" style={{ color: seg.color }}>
                      {getPersonaIcon(seg.segment)}
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-brand-border/60 text-brand-text">
                      {seg.share_percent}% share
                    </span>
                  </div>
                  <h3 className="text-sm font-extrabold text-brand-text">{seg.segment}</h3>
                  <p className="text-[11px] text-brand-muted leading-relaxed">{seg.description}</p>
                </div>
                <div className="border-t border-brand-border/60 pt-3 flex items-center justify-between text-[10px] text-brand-muted">
                  <span>Count: <strong className="text-brand-text">{seg.count}</strong></span>
                  <span>Avg Ticket: <strong className="text-brand-text">${seg.avg_monetary}</strong></span>
                </div>
              </div>
            ))}
          </div>

          {/* Table list and splits */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Customer List (8 Cols) */}
            <div className="lg:col-span-8 glass-panel p-6 border-brand-border space-y-4">
              <h3 className="text-sm font-extrabold text-brand-text">RFM Analytics Directory</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-brand-border text-brand-muted font-bold">
                      <th className="py-2">Customer ID</th>
                      <th className="py-2">Recency (Days)</th>
                      <th className="py-2">Frequency (Visits)</th>
                      <th className="py-2">Monetary ($)</th>
                      <th className="py-2">Assigned Persona</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-border/60">
                    {segments.map((item, idx) => (
                      <tr key={idx} className="text-brand-text hover:bg-brand-border/20 transition">
                        <td className="py-2.5 font-bold">{item.customer_id}</td>
                        <td className="py-2.5">{item.recency} days ago</td>
                        <td className="py-2.5">{item.frequency} times</td>
                        <td className="py-2.5 font-semibold text-brand-cyan">${item.monetary.toLocaleString()}</td>
                        <td className="py-2.5">
                          <span
                            className="px-2 py-0.5 rounded-full text-[9px] font-bold border"
                            style={{ 
                              color: item.color, 
                              borderColor: `${item.color}33`, 
                              backgroundColor: `${item.color}11` 
                            }}
                          >
                            {item.segment}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Segment Pie splits (4 Cols) */}
            <div className="lg:col-span-4 glass-panel p-6 border-brand-border h-[320px] flex flex-col justify-between">
              <span className="text-xs font-bold text-brand-text block uppercase tracking-wide">Segment Splits</span>
              <div className="flex-1 w-full relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip
                      contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b" }}
                      itemStyle={{ fontSize: "11px", color: "#f8fafc" }}
                    />
                    <Pie
                      data={summary}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={65}
                      paddingAngle={3}
                      dataKey="share_percent"
                      nameKey="segment"
                    >
                      {summary.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="pt-2 border-t border-brand-border/60 flex items-center justify-center gap-1.5 text-brand-warning">
                <Mail className="h-4 w-4" />
                <button className="text-[10px] font-semibold hover:underline">
                  Draft email blast to target segments
                </button>
              </div>
            </div>

          </div>

        </div>
      )}
    </div>
  );
};
