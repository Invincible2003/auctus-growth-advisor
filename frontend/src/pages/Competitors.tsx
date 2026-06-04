import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { 
  Plus, 
  Trash2, 
  AlertCircle, 
  HelpCircle,
  TrendingUp,
  Award,
  Zap,
  Target
} from "lucide-react";

export const Competitors: React.FC = () => {
  const [competitorName, setCompetitorName] = useState("");
  const [competitors, setCompetitors] = useState<any[]>([]);
  const [activeReport, setActiveReport] = useState<any>(null);
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCompetitors();
  }, []);

  const fetchCompetitors = async () => {
    try {
      setFetching(true);
      const data = await api.advisor.getCompetitors();
      setCompetitors(data);
      if (data.length > 0) {
        setActiveReport(data[0]);
      }
    } catch (e: any) {
      console.error(e);
    } finally {
      setFetching(false);
    }
  };

  const handleAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!competitorName.trim() || loading) return;

    setLoading(true);
    setError(null);
    try {
      const res = await api.advisor.generateSwot(competitorName);
      setCompetitors((prev) => [res, ...prev]);
      setActiveReport(res);
      setCompetitorName("");
      fetchCompetitors();
    } catch (e: any) {
      setError(e.message || "Failed to audit competitor. Verify internet connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Remove this competitor report?")) return;

    try {
      await api.advisor.deleteCompetitor(id);
      setCompetitors((prev) => prev.filter((c) => c.id !== id));
      if (activeReport?.id === id) {
        setActiveReport(null);
      }
    } catch (e: any) {
      alert(e.message || "Failed to delete competitor report.");
    }
  };

  return (
    <div className="p-6 text-left max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-brand-text">Competitor Intelligence</h1>
        <p className="text-xs text-brand-muted mt-1 font-medium">
          Input local competitor names to auto-generate competitive SWOT audits.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left List Pane (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Form */}
          <form onSubmit={handleAudit} className="glass-panel p-4 border-brand-border space-y-3">
            <span className="text-[10px] uppercase font-bold text-brand-muted tracking-wide block">Audit Competitor</span>
            {error && (
              <div className="p-2.5 rounded bg-brand-danger/10 border border-brand-danger/25 text-brand-danger text-[10px] flex items-center gap-1.5">
                <AlertCircle className="h-3.5 w-3.5" />
                <span>{error}</span>
              </div>
            )}
            <div className="flex gap-2">
              <input
                type="text"
                value={competitorName}
                onChange={(e) => setCompetitorName(e.target.value)}
                className="flex-1 px-3 py-1.5 rounded bg-brand-bg border border-brand-border text-xs text-brand-text focus:outline-none focus:border-brand-cyan"
                placeholder="Competitor Name"
                required
              />
              <button
                type="submit"
                disabled={loading || !competitorName.trim()}
                className="p-2 rounded bg-brand-cyan hover:bg-brand-cyanLight text-brand-bg disabled:opacity-50 transition"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </form>

          {/* List */}
          <div className="glass-panel p-4 border-brand-border space-y-2">
            <span className="text-[10px] uppercase font-bold text-brand-muted tracking-wide block mb-2">Saved Audits</span>
            {fetching ? (
              <div className="text-xs text-brand-muted py-6 text-center animate-pulse">Loading audits...</div>
            ) : competitors.length === 0 ? (
              <div className="text-xs text-brand-muted py-6 text-center">No audits found.</div>
            ) : (
              <div className="space-y-1.5">
                {competitors.map((comp) => (
                  <button
                    key={comp.id}
                    onClick={() => setActiveReport(comp)}
                    className={`w-full p-2.5 rounded-lg border text-left flex items-center justify-between text-xs transition-all ${
                      activeReport?.id === comp.id
                        ? "bg-brand-cyan/15 border-brand-cyan/35 text-brand-cyan font-bold"
                        : "bg-brand-bg/50 border-brand-border text-brand-text hover:bg-brand-border/40"
                    }`}
                  >
                    <span>{comp.name}</span>
                    <button
                      onClick={(e) => handleDelete(comp.id, e)}
                      className="p-1 rounded hover:bg-brand-danger/10 text-brand-muted hover:text-brand-danger transition"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Audit Details Panel (8 Cols) */}
        <div className="lg:col-span-8">
          {loading && (
            <div className="glass-panel p-8 border-brand-border h-[400px] flex flex-col items-center justify-center text-center space-y-4 animate-pulse">
              <TrendingUp className="h-8 w-8 text-brand-cyan animate-bounce" />
              <span className="text-xs text-brand-muted font-semibold">Gemini is compiling SWOT reports...</span>
            </div>
          )}

          {!loading && !activeReport && (
            <div className="glass-panel p-8 border-brand-border h-[400px] flex flex-col items-center justify-center text-center space-y-3 text-brand-muted">
              <HelpCircle className="h-12 w-12 text-brand-border" />
              <span className="text-xs font-bold text-brand-text">Awaiting Competitor Selection</span>
              <p className="text-[10px] max-w-[280px] leading-relaxed">
                Add or choose a local competitor from the side menu to review market positioning.
              </p>
            </div>
          )}

          {!loading && activeReport && (
            <div className="space-y-6 animate-fade-in text-left">
              {/* Executive Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="glass-panel p-5 border-brand-border space-y-1">
                  <span className="text-[9px] uppercase font-bold text-brand-cyan tracking-wider block">Market Position</span>
                  <p className="text-xs text-brand-text font-bold leading-normal">{activeReport.market_position}</p>
                </div>
                <div className="glass-panel p-5 border-brand-border space-y-1">
                  <span className="text-[9px] uppercase font-bold text-brand-cyan tracking-wider block">Pricing Strategy</span>
                  <p className="text-xs text-brand-text font-bold leading-normal">{activeReport.pricing_strategy}</p>
                </div>
              </div>

              {/* SWOT Quadrant Matrix */}
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-bold text-brand-muted tracking-wide block">SWOT Analysis Matrix</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Strengths */}
                  <div className="glass-panel p-5 border-brand-success/15 bg-brand-success/5 space-y-2.5">
                    <div className="flex items-center gap-1.5 text-brand-success">
                      <Award className="h-4.5 w-4.5" />
                      <span className="text-xs font-black uppercase tracking-wider">Strengths</span>
                    </div>
                    <ul className="space-y-2 text-[11px] text-brand-text">
                      {activeReport.swot_analysis?.strengths?.map((str: string, i: number) => (
                        <li key={i} className="flex items-start gap-1">
                          <span>•</span>
                          <span>{str}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Weaknesses */}
                  <div className="glass-panel p-5 border-brand-danger/15 bg-brand-danger/5 space-y-2.5">
                    <div className="flex items-center gap-1.5 text-brand-danger">
                      <Trash2 className="h-4.5 w-4.5" />
                      <span className="text-xs font-black uppercase tracking-wider">Weaknesses</span>
                    </div>
                    <ul className="space-y-2 text-[11px] text-brand-text">
                      {activeReport.swot_analysis?.weaknesses?.map((str: string, i: number) => (
                        <li key={i} className="flex items-start gap-1">
                          <span>•</span>
                          <span>{str}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Opportunities */}
                  <div className="glass-panel p-5 border-brand-cyan/15 bg-brand-cyan/5 space-y-2.5">
                    <div className="flex items-center gap-1.5 text-brand-cyan">
                      <Zap className="h-4.5 w-4.5" />
                      <span className="text-xs font-black uppercase tracking-wider">Opportunities</span>
                    </div>
                    <ul className="space-y-2 text-[11px] text-brand-text">
                      {activeReport.swot_analysis?.opportunities?.map((str: string, i: number) => (
                        <li key={i} className="flex items-start gap-1">
                          <span>•</span>
                          <span>{str}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Threats */}
                  <div className="glass-panel p-5 border-brand-warning/15 bg-brand-warning/5 space-y-2.5">
                    <div className="flex items-center gap-1.5 text-brand-warning">
                      <Target className="h-4.5 w-4.5" />
                      <span className="text-xs font-black uppercase tracking-wider">Threats</span>
                    </div>
                    <ul className="space-y-2 text-[11px] text-brand-text">
                      {activeReport.swot_analysis?.threats?.map((str: string, i: number) => (
                        <li key={i} className="flex items-start gap-1">
                          <span>•</span>
                          <span>{str}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* AI Report Audit Summary */}
              <div className="glass-panel p-6 border-brand-border space-y-2">
                <span className="text-[10px] uppercase font-bold text-brand-muted tracking-wide block">Strategic SWOT Audit Report</span>
                <p className="text-xs text-brand-text leading-relaxed whitespace-pre-line">
                  {activeReport.ai_report}
                </p>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
};
