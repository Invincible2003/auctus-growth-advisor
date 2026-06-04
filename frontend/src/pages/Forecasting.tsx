import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { 
  TrendingUp, 
  Sparkles, 
  AlertCircle,
  HelpCircle,
  Activity,
  ChevronRight
} from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";

export const Forecasting: React.FC = () => {
  const [days, setDays] = useState(30);
  const [forecastData, setForecastData] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>({});
  const [aiExplanation, setAiExplanation] = useState("");
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchForecast();
  }, [days]);

  const fetchForecast = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.analytics.getForecasting(days);
      setForecastData(res.predictions);
      setMetrics(res.metrics);
      setAiExplanation(res.ai_explanation);
    } catch (e: any) {
      setError(e.message || "Failed to compile sales forecasts.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 text-left max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-brand-text">Sales Predictive Forecasting</h1>
          <p className="text-xs text-brand-muted mt-1 font-medium">
            Analyze future sales projections using Holt-Winters and Linear Regression.
          </p>
        </div>
        
        {/* Day Selectors */}
        <div className="flex bg-brand-card border border-brand-border rounded-lg p-1 shrink-0">
          {[30, 90, 180, 365].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                days === d
                  ? "bg-brand-cyan text-brand-bg shadow-cyan-glow"
                  : "text-brand-muted hover:text-brand-text"
              }`}
            >
              {d} Days
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-6 animate-pulse-slow">
          <div className="h-96 bg-brand-card border border-brand-border rounded-xl" />
          <div className="h-44 bg-brand-card border border-brand-border rounded-xl" />
        </div>
      ) : error ? (
        <div className="p-4 rounded-xl bg-brand-danger/10 border border-brand-danger/25 text-brand-danger text-sm flex items-center gap-3">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      ) : (
        <div className="space-y-6 animate-fade-in">
          
          {/* Predictive Area Chart */}
          <div className="glass-panel p-6 border-brand-border flex flex-col h-[400px]">
            <div className="mb-4">
              <h3 className="text-sm font-extrabold text-brand-text">Predicted Revenue Flow</h3>
              <span className="text-[10px] text-brand-muted block mt-0.5">
                Displays predicted values alongside shaded upper and lower bounds.
              </span>
            </div>

            <div className="flex-1 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={forecastData} margin={{ top: 10, right: 5, left: -25, bottom: 5 }}>
                  <defs>
                    {/* Confidence bound fill */}
                    <linearGradient id="colorUncertainty" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.01}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="date" stroke="#475569" fontSize={9} />
                  <YAxis stroke="#475569" fontSize={9} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b" }}
                    labelStyle={{ color: "#94a3b8", fontSize: "10px" }}
                    itemStyle={{ fontSize: "12px", color: "#f8fafc" }}
                  />
                  <Legend wrapperStyle={{ fontSize: "10px", marginTop: "10px" }} />
                  {/* Upper/Lower shaded interval */}
                  <Area
                    name="Confidence Bounds Range"
                    type="monotone"
                    dataKey="upper_bound"
                    stroke="transparent"
                    fill="url(#colorUncertainty)"
                    activeDot={false}
                  />
                  {/* Forecast Line */}
                  <Area
                    name="Forecasted Revenue ($)"
                    type="monotone"
                    dataKey="revenue"
                    stroke="#06b6d4"
                    strokeWidth={2}
                    fill="transparent"
                    activeDot={{ r: 5 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Model Quality Indicators & AI Explanation */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            
            {/* AI Advisor Explanation */}
            <div className="md:col-span-2 glass-panel p-6 border-brand-cyan/20 bg-brand-cyan/5 flex gap-4 text-left">
              <Sparkles className="h-6 w-6 text-brand-cyan shrink-0" />
              <div className="space-y-1.5">
                <h4 className="text-xs font-black uppercase tracking-wider text-brand-cyan">AI Forecast Diagnostic</h4>
                <p className="text-xs text-brand-text leading-relaxed whitespace-pre-line">{aiExplanation}</p>
              </div>
            </div>

            {/* Model Metrics */}
            <div className="glass-panel p-6 border-brand-border space-y-4">
              <h4 className="text-xs font-black uppercase tracking-wide text-brand-text flex items-center gap-2">
                <Activity className="h-4 w-4 text-brand-cyan" />
                <span>Forecasting Diagnostics</span>
              </h4>
              <div className="space-y-3.5 text-xs">
                <div className="flex justify-between border-b border-brand-border/60 pb-1.5">
                  <span className="text-brand-muted">Model Engine:</span>
                  <span className="font-bold text-brand-text">{metrics.model_used || "Simulation"}</span>
                </div>
                <div className="flex justify-between border-b border-brand-border/60 pb-1.5">
                  <span className="text-brand-muted">Confidence (R²):</span>
                  <span className="font-bold text-brand-success">{metrics.r2_score * 100}%</span>
                </div>
                <div className="flex justify-between border-b border-brand-border/60 pb-1.5">
                  <span className="text-brand-muted">Mean Abs Error:</span>
                  <span className="font-bold text-brand-text">${metrics.mae}</span>
                </div>
                <div className="flex justify-between pb-1">
                  <span className="text-brand-muted">Root Mean Sq Error:</span>
                  <span className="font-bold text-brand-text">${metrics.rmse}</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      )}
    </div>
  );
};
