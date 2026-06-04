import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { 
  Smile, 
  Meh, 
  Frown, 
  Sparkles, 
  AlertCircle, 
  MessageSquare,
  Star
} from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

export const Sentiment: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSentiment();
  }, []);

  const fetchSentiment = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.analytics.getSentiment();
      setData(res);
    } catch (e: any) {
      setError(e.message || "Failed to load customer sentiment audits.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-left space-y-6 animate-pulse">
        <div className="h-6 w-48 bg-brand-border rounded mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-80 bg-brand-card border border-brand-border rounded-xl" />
          <div className="md:col-span-2 h-80 bg-brand-card border border-brand-border rounded-xl" />
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

  const { distribution, average_rating, word_cloud, trending_topics, ai_summary } = data;

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5 text-brand-warning">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className={`h-4.5 w-4.5 ${i < Math.round(rating) ? "fill-brand-warning" : "text-brand-border"}`} />
        ))}
      </div>
    );
  };

  return (
    <div className="p-6 text-left max-w-5xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-brand-text">Customer Sentiment Analysis</h1>
        <p className="text-xs text-brand-muted mt-1 font-medium">
          Extract polarity indicators, keyword densities, and thematic audits from reviews.
        </p>
      </div>

      {/* Row 1: KPI Rating & Distribution & AI summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Rating & Distribution Pie (5 Cols) */}
        <div className="lg:col-span-5 glass-panel p-6 border-brand-border flex flex-col justify-between h-[360px]">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[10px] text-brand-muted font-bold block uppercase tracking-wider">Average Rating</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-brand-text">{average_rating}</span>
                <span className="text-xs text-brand-muted">/ 5 Stars</span>
              </div>
            </div>
            {renderStars(average_rating)}
          </div>

          <div className="flex-1 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="90%">
              <PieChart>
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b" }}
                  itemStyle={{ fontSize: "11px", color: "#f8fafc" }}
                />
                <Pie
                  data={distribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={65}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {distribution.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            {/* Custom Legend */}
            <div className="absolute bottom-0 flex justify-center gap-4 text-[9px] text-brand-muted">
              {distribution.map((entry: any) => (
                <div key={entry.name} className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: entry.color }} />
                  <span>{entry.name} ({entry.value}%)</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI Sentiment Summary (7 Cols) */}
        <div className="lg:col-span-7 glass-panel p-6 border-brand-cyan/20 bg-brand-cyan/5 flex flex-col justify-between h-[360px]">
          <div className="space-y-4 text-left">
            <div className="flex items-center gap-2 text-brand-cyan">
              <Sparkles className="h-5 w-5" />
              <h3 className="text-xs font-black uppercase tracking-wider">AI Customer Feedback Summary</h3>
            </div>
            <p className="text-xs text-brand-text leading-relaxed whitespace-pre-line">
              {ai_summary}
            </p>
          </div>

          <div className="border-t border-brand-border/60 pt-4 flex items-center gap-3 text-[10px] text-brand-muted">
            <MessageSquare className="h-4 w-4 text-brand-cyan" />
            <span>AI automatically aggregates comments to flag customer satisfaction pain-points.</span>
          </div>
        </div>

      </div>

      {/* Row 2: simulated Word Cloud & Trending Topics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Word Cloud box */}
        <div className="glass-panel p-6 border-brand-border flex flex-col justify-between min-h-[300px]">
          <div>
            <h3 className="text-xs font-extrabold text-brand-text block uppercase tracking-wider">Keyword Clouds Density</h3>
            <span className="text-[10px] text-brand-muted block mt-0.5">Frequently mentioned keywords in customer logs.</span>
          </div>

          <div className="flex-1 flex flex-wrap items-center justify-center gap-3.5 p-4 mt-2">
            {word_cloud.length === 0 ? (
              <span className="text-xs text-brand-muted">No keywords compiled yet.</span>
            ) : (
              word_cloud.map((word: any, i: number) => {
                // Determine size and opacity class based on density value
                const sizes = ["text-xs", "text-sm", "text-base", "text-lg", "text-xl", "text-2xl"];
                const opacities = ["opacity-40", "opacity-55", "opacity-70", "opacity-85", "opacity-100"];
                const index = Math.min(sizes.length - 1, Math.floor(word.value / 2));
                const opIndex = Math.min(opacities.length - 1, Math.floor(word.value / 3));
                
                return (
                  <span
                    key={word.text}
                    className={`font-black text-brand-cyan uppercase select-none cursor-default hover:text-brand-cyanLight transition duration-200 ${sizes[index]} ${opacities[opIndex]}`}
                    title={`Count: ${word.value}`}
                  >
                    {word.text}
                  </span>
                );
              })
            )}
          </div>
        </div>

        {/* Trending topics */}
        <div className="glass-panel p-6 border-brand-border flex flex-col justify-between min-h-[300px]">
          <div>
            <h3 className="text-xs font-extrabold text-brand-text block uppercase tracking-wider">Thematic Trending Topics</h3>
            <span className="text-[10px] text-brand-muted block mt-0.5">Top satisfaction pillars detected by the advisor.</span>
          </div>

          <div className="space-y-3 mt-4 flex-1">
            {trending_topics.map((item: any, idx: number) => (
              <div key={idx} className="p-3.5 rounded-lg bg-brand-bg/60 border border-brand-border flex items-center justify-between text-xs">
                <div className="space-y-1">
                  <span className="font-bold text-brand-text">{item.topic}</span>
                  <span className="text-[10px] text-brand-muted block">Indexed mentions: {item.count} reviews</span>
                </div>
                <span className={`px-2.5 py-1 rounded text-[10px] font-bold ${
                  item.sentiment === "Positive" 
                    ? "bg-brand-success/15 text-brand-success border border-brand-success/20" 
                    : (item.sentiment === "Negative" ? "bg-brand-danger/15 text-brand-danger border border-brand-danger/20" : "bg-brand-blue/15 text-brand-blue border border-brand-blue/20")
                }`}>
                  {item.sentiment} Sentiment
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
